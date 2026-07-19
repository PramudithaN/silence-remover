/**
 * Default silence detection parameters for video clips.
 */
export const DEFAULT_VIDEO_SETTINGS = {
  thresholdDb: -35,
  minSilenceDuration: 0.3,
  paddingSeconds: 0.05,
};

/**
 * Decodes a video/audio File into an AudioBuffer using the Web Audio API.
 * decodeAudioData extracts the audio track regardless of the container (mp4, webm, mov, etc.),
 * as long as the codec is supported by the browser.
 */
export async function decodeAudioFromFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const audioCtx = new AudioContextClass();
  try {
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    return audioBuffer;
  } finally {
    await audioCtx.close();
  }
}

/**
 * Converts a linear RMS amplitude (0-1) to decibels.
 */
function rmsToDb(rms) {
  if (rms <= 0) return -Infinity;
  return 20 * Math.log10(rms);
}

/**
 * Computes RMS volume for a window of samples across all channels.
 */
function computeWindowRms(buffer, startSample, windowSize) {
  const numChannels = buffer.numberOfChannels;
  let sumSquares = 0;
  let count = 0;

  for (let ch = 0; ch < numChannels; ch++) {
    const data = buffer.getChannelData(ch);
    const end = Math.min(startSample + windowSize, data.length);
    for (let i = startSample; i < end; i++) {
      sumSquares += data[i] * data[i];
      count++;
    }
  }

  if (count === 0) return 0;
  return Math.sqrt(sumSquares / count);
}

/**
 * Analyzes an AudioBuffer and returns detected silent segments.
 */
export function detectSilence(buffer, settings = DEFAULT_VIDEO_SETTINGS) {
  const sampleRate = buffer.sampleRate;
  const windowMs = 50; // analysis resolution
  const windowSize = Math.floor((windowMs / 1000) * sampleRate);
  const totalSamples = buffer.length;

  // Step 1: Classify each window as silent or not
  const windows = [];
  for (let start = 0; start < totalSamples; start += windowSize) {
    const rms = computeWindowRms(buffer, start, windowSize);
    const db = rmsToDb(rms);
    windows.push({
      time: start / sampleRate,
      isSilent: db < settings.thresholdDb,
    });
  }

  // Step 2: Merge consecutive silent windows into raw segments
  const rawSegments = [];
  let currentStart = null;

  for (let i = 0; i < windows.length; i++) {
    const w = windows[i];
    if (w.isSilent && currentStart === null) {
      currentStart = w.time;
    } else if (!w.isSilent && currentStart !== null) {
      rawSegments.push({ start: currentStart, end: w.time });
      currentStart = null;
    }
  }
  if (currentStart !== null) {
    rawSegments.push({ start: currentStart, end: buffer.duration });
  }

  // Step 3: Filter by minSilenceDuration and apply padding
  const padding = settings.paddingSeconds || 0;
  const segments = rawSegments
    .filter((s) => s.end - s.start >= settings.minSilenceDuration)
    .map((s, idx) => ({
      id: `silence-${idx}-${Math.round(s.start * 1000)}`,
      start: Math.min(s.start + padding, s.end),
      end: Math.max(s.end - padding, s.start),
      keepForRemoval: true,
    }))
    .filter((s) => s.end > s.start);

  return segments;
}

/**
 * Computes the inverse ranges of video to KEEP given the silent segments marked for removal.
 */
export function computeKeepRanges(totalDuration, segmentsToRemove) {
  const sorted = [...segmentsToRemove]
    .filter((s) => s.keepForRemoval)
    .sort((a, b) => a.start - b.start);

  const keepRanges = [];
  let cursor = 0;

  for (const seg of sorted) {
    if (seg.start > cursor) {
      keepRanges.push({ start: cursor, end: seg.start });
    }
    cursor = Math.max(cursor, seg.end);
  }
  if (cursor < totalDuration) {
    keepRanges.push({ start: cursor, end: totalDuration });
  }

  return keepRanges.filter((r) => r.end - r.start > 0.01);
}
