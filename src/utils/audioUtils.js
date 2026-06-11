// ── Helpers ────────────────────────────────────────────────────
export function getMono(buf) {
  if (buf.numberOfChannels === 1) return buf.getChannelData(0);
  const L = buf.getChannelData(0), R = buf.getChannelData(1);
  const m = new Float32Array(L.length);
  for (let i = 0; i < L.length; i++) m[i] = (L[i] + R[i]) * 0.5;
  return m;
}

export function encodeWAV(ab) {
  const nc = ab.numberOfChannels, sr = ab.sampleRate, n = ab.length;
  const ba = nc * 2, ds = n * ba;
  const buf = new ArrayBuffer(44 + ds), v = new DataView(buf);
  const ws = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  ws(0, 'RIFF'); v.setUint32(4, 36 + ds, true); ws(8, 'WAVE'); ws(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, nc, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * ba, true);
  v.setUint16(32, ba, true); v.setUint16(34, 16, true);
  ws(36, 'data'); v.setUint32(40, ds, true);
  let o = 44;
  for (let i = 0; i < n; i++) for (let c = 0; c < nc; c++) {
    const s = Math.max(-1, Math.min(1, ab.getChannelData(c)[i]));
    v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    o += 2;
  }
  return new Blob([buf], { type: 'audio/wav' });
}

// ── Core processor ─────────────────────────────────────────────
export async function processSingleFile(file, { threshold, minSilence, padding }) {
  const ab = await file.arrayBuffer();
  const decodeCtx = new AudioContext();
  let audioBuf;
  try   { audioBuf = await decodeCtx.decodeAudioData(ab); }
  finally { await decodeCtx.close(); }

  const sr = audioBuf.sampleRate, nc = audioBuf.numberOfChannels;
  const mono = getMono(audioBuf), len = mono.length;
  const thrAmp  = Math.pow(10, threshold / 20);
  const fSz     = Math.round(sr * 0.02);
  const minSilF = Math.round(minSilence / 20);
  const padF    = Math.round(padding / 20);
  const numF    = Math.ceil(len / fSz);

  // RMS per 20ms frame → speech/silence
  const speech = new Uint8Array(numF);
  for (let i = 0; i < numF; i++) {
    const s = i * fSz, e = Math.min(s + fSz, len);
    let sq = 0;
    for (let j = s; j < e; j++) sq += mono[j] * mono[j];
    speech[i] = Math.sqrt(sq / (e - s)) >= thrAmp ? 1 : 0;
  }

  // Bridge short silence gaps
  let silRun = 0;
  for (let i = 0; i < numF; i++) {
    if (speech[i]) silRun = 0;
    else if (++silRun <= minSilF) speech[i] = 1;
  }

  // Apply padding
  const padded = new Uint8Array(speech);
  for (let i = 0; i < numF; i++) {
    if (speech[i]) padded.fill(1, Math.max(0, i - padF), Math.min(numF, i + padF + 1));
  }

  // Collect contiguous speech ranges
  const segs = []; let inSeg = false, segS = 0;
  for (let i = 0; i <= numF; i++) {
    const s = i < numF ? padded[i] : 0;
    if (s && !inSeg)  { segS = i * fSz; inSeg = true; }
    if (!s && inSeg)  { segs.push([segS, Math.min(i * fSz, len)]); inSeg = false; }
  }

  if (!segs.length) throw new Error('No speech detected -try raising the silence threshold.');

  // Build output buffer
  const outLen    = segs.reduce((t, [a, b]) => t + b - a, 0);
  const encodeCtx = new AudioContext();
  const outBuf    = encodeCtx.createBuffer(nc, outLen, sr);
  await encodeCtx.close();
  const srcCh = Array.from({ length: nc }, (_, c) => audioBuf.getChannelData(c));
  let wp = 0;
  for (const [a, b] of segs) {
    for (let c = 0; c < nc; c++) outBuf.copyToChannel(srcCh[c].subarray(a, b), c, wp);
    wp += b - a;
  }

  return { blob: encodeWAV(outBuf), origSec: len / sr, outSec: outLen / sr, samples: mono, padded };
}

// ── Formatters ─────────────────────────────────────────────────
export function fmtTime(sec) {
  if (sec < 60) return sec.toFixed(1) + 's';
  return Math.floor(sec / 60) + ':' + (sec % 60).toFixed(0).padStart(2, '0');
}

export function fmtBytes(b) {
  if (b < 1024)    return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(1) + ' MB';
}

export function shortName(name, max = 44) {
  if (name.length <= max) return name;
  const dot = name.lastIndexOf('.');
  const ext = dot > 0 ? name.slice(dot) : '';
  return name.slice(0, max - ext.length - 1) + '\u2026' + ext;
}
