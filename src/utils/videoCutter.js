import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpegInstance = null;

export async function getFFmpeg(onLog) {
  if (ffmpegInstance) return ffmpegInstance;

  const ffmpeg = new FFmpeg();
  if (onLog) {
    ffmpeg.on("log", ({ message }) => onLog(message));
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const FFMPEG_SOURCES = [
    {
      name: "Local public assets",
      coreURL: `${origin}/ffmpeg/ffmpeg-core.js`,
      wasmURL: `${origin}/ffmpeg/ffmpeg-core.wasm`,
    },
    {
      name: "unpkg CDN",
      coreURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js",
      wasmURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm",
    },
    {
      name: "jsdelivr CDN",
      coreURL: "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js",
      wasmURL: "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm",
    },
  ];

  let lastError = null;

  for (const src of FFMPEG_SOURCES) {
    try {
      console.log(`Attempting to load FFmpeg engine via ${src.name}...`);
      const coreBlob = await toBlobURL(src.coreURL, "text/javascript");
      const wasmBlob = await toBlobURL(src.wasmURL, "application/wasm");

      await ffmpeg.load({
        coreURL: coreBlob,
        wasmURL: wasmBlob,
      });

      ffmpegInstance = ffmpeg;
      console.log(`Successfully loaded FFmpeg engine via ${src.name}`);
      return ffmpeg;
    } catch (e) {
      console.warn(`Failed to load FFmpeg engine via ${src.name}:`, e);
      lastError = e;
    }
  }

  throw new Error(
    `Failed to load video processing engine (${lastError?.message || "Load failed"}). Please ensure local /ffmpeg assets exist or check network access.`
  );
}

/**
 * Cuts the input file down to only the given "keep" ranges and
 * concatenates them into a single output MP4 file.
 */
export async function cutVideoToKeepRanges(
  file,
  keepRanges,
  mode = "fast",
  onProgress
) {
  if (!keepRanges || keepRanges.length === 0) {
    return file; // No cuts needed
  }

  onProgress?.({ stage: "loading-engine", percent: 0 });
  
  let logs = [];
  const ffmpeg = await getFFmpeg((msg) => {
    logs.push(msg);
  });

  const inputExt = file.name.split(".").pop() || "mp4";
  const timestamp = Date.now();
  const inputName = `input_${timestamp}.${inputExt}`;
  
  await ffmpeg.writeFile(inputName, await fetchFile(file));

  ffmpeg.on("progress", ({ progress }) => {
    onProgress?.({
      stage: "trimming",
      percent: Math.min(95, Math.round(progress * 100)),
    });
  });

  const segmentFiles = [];

  // Step 1: Slice video into kept segments
  for (let i = 0; i < keepRanges.length; i++) {
    const { start, end } = keepRanges[i];
    const duration = end - start;
    const segmentName = `segment_${timestamp}_${String(i).padStart(4, "0")}.mp4`;

    const exitCode = await ffmpeg.exec([
      "-ss",
      start.toFixed(3),
      "-i",
      inputName,
      "-t",
      duration.toFixed(3),
      "-vf",
      "pad=ceil(iw/2)*2:ceil(ih/2)*2",
      "-c:v",
      "libx264",
      "-preset",
      "ultrafast",
      "-tune",
      "zerolatency",
      "-crf",
      mode === "fast" ? "23" : "18",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-avoid_negative_ts",
      "make_zero",
      segmentName,
    ]);

    if (exitCode !== 0) {
      const errDetail = logs.slice(-5).join("\n");
      throw new Error(
        `Failed to process video segment #${i + 1} (Exit code ${exitCode}). ${errDetail}`
      );
    }

    segmentFiles.push(segmentName);
    onProgress?.({
      stage: "trimming",
      percent: Math.round(((i + 1) / keepRanges.length) * 80),
    });
  }

  const outputName = `output_${timestamp}.mp4`;

  // Optimization: If only 1 segment was kept, no concat is needed!
  if (segmentFiles.length === 1) {
    const singleData = await ffmpeg.readFile(segmentFiles[0]);
    onProgress?.({ stage: "done", percent: 100 });

    try {
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(segmentFiles[0]);
    } catch {}

    const uint8 = new Uint8Array(singleData);
    const bufferCopy = new ArrayBuffer(uint8.byteLength);
    new Uint8Array(bufferCopy).set(uint8);
    return new Blob([bufferCopy], { type: "video/mp4" });
  }

  // Step 2: Build concat list file and stitch segments
  onProgress?.({ stage: "concatenating", percent: 85 });
  const concatListContent = segmentFiles.map((f) => `file '${f}'`).join("\n");
  const concatListName = `concat_list_${timestamp}.txt`;
  
  // Use TextEncoder to guarantee clean UTF-8 string writing in Emscripten VFS
  await ffmpeg.writeFile(
    concatListName,
    new TextEncoder().encode(concatListContent)
  );

  // Try Concat Pass 1: Stream Copy (Fastest)
  let concatExitCode = await ffmpeg.exec([
    "-f",
    "concat",
    "-safe",
    "0",
    "-i",
    concatListName,
    "-c",
    "copy",
    outputName,
  ]);

  // Fallback Concat Pass 2: Re-encode video & audio if stream copy fails
  if (concatExitCode !== 0) {
    console.warn("Concat stream copy failed. Retrying with ultrafast re-encode fallback...");
    logs = [];
    concatExitCode = await ffmpeg.exec([
      "-f",
      "concat",
      "-safe",
      "0",
      "-i",
      concatListName,
      "-c:v",
      "libx264",
      "-preset",
      "ultrafast",
      "-tune",
      "zerolatency",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      outputName,
    ]);
  }

  if (concatExitCode !== 0) {
    const lastLogs = logs.slice(-8).join(" ");
    throw new Error(
      `Failed to concatenate video segments (Exit code ${concatExitCode}). ${lastLogs}`
    );
  }

  const data = await ffmpeg.readFile(outputName);
  onProgress?.({ stage: "done", percent: 100 });

  // Cleanup Virtual Filesystem
  try {
    await ffmpeg.deleteFile(inputName);
    for (const f of segmentFiles) await ffmpeg.deleteFile(f);
    await ffmpeg.deleteFile(concatListName);
    await ffmpeg.deleteFile(outputName);
  } catch {
    // Ignore VFS cleanup errors
  }

  const uint8 = new Uint8Array(data);
  const bufferCopy = new ArrayBuffer(uint8.byteLength);
  new Uint8Array(bufferCopy).set(uint8);

  return new Blob([bufferCopy], { type: "video/mp4" });
}
