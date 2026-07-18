import React, { useState, useCallback } from 'react';
import {
  Box, Container, Typography, Button,
  LinearProgress, Alert, Stack,
} from '@mui/material';
import {
  GraphicEq, Lock, AutoFixHigh, Download, FolderZip,
} from '@mui/icons-material';
import JSZip from 'jszip';

import DropZoneCard    from './components/DropZoneCard';
import FileQueueCard   from './components/FileQueueCard';
import SettingsCard    from './components/SettingsCard';
import WaveformCard    from './components/WaveformCard';
import StatsRow        from './components/StatsRow';
import { processSingleFile, fmtTime } from './utils/audioUtils';

const INITIAL_SETTINGS = { threshold: -40, minSilence: 300, padding: 50 };

export default function App() {
  const [files,       setFiles]       = useState([]);
  const [outputBlobs, setOutputBlobs] = useState([]);
  const [itemStates,  setItemStates]  = useState([]);
  const [settings,    setSettings]    = useState(INITIAL_SETTINGS);
  const [processing,  setProcessing]  = useState(false);
  const [progress,    setProgress]    = useState({ pct: 0, msg: '' });
  const [showProgress, setShowProgress] = useState(false);
  const [waveformData, setWaveformData] = useState(null);
  const [stats,       setStats]       = useState(null);
  const [error,       setError]       = useState(null);
  const [zipBusy,     setZipBusy]     = useState(false);

  // ── File selection ─────────────────────────────────────────
  const loadFiles = useCallback((fileList) => {
    const arr = Array.from(fileList);
    setFiles(arr);
    setOutputBlobs(new Array(arr.length).fill(null));
    setItemStates(arr.map(() => ({ state: 'queued', sub: '' })));
    setWaveformData(null);
    setStats(null);
    setError(null);

    if (arr.length === 1) {
      (async () => {
        try {
          const ac  = new AudioContext();
          const buf = await ac.decodeAudioData(await arr[0].arrayBuffer());
          await ac.close();
          setWaveformData({ samples: buf.getChannelData(0), padded: null });
        } catch {}
      })();
    }
  }, []);

  const updateItem = (i, state, sub) => {
    setItemStates(prev => {
      const next = [...prev];
      next[i] = { state, sub: sub ?? prev[i]?.sub ?? '' };
      return next;
    });
  };

  // ── Processing ─────────────────────────────────────────────
  const processAll = async () => {
    if (!files.length || processing) return;
    setError(null);
    setProcessing(true);
    setShowProgress(true);
    setStats(null);
    setWaveformData(null);

    const total = files.length;
    let doneCount = 0;
    const blobs = new Array(total).fill(null);

    for (let i = 0; i < total; i++) {
      updateItem(i, 'processing', 'Processing\u2026');
      setProgress({ pct: Math.round((i / total) * 100), msg: `Processing file ${i + 1} of ${total}` });

      try {
        const result = await processSingleFile(files[i], settings);
        blobs[i] = result.blob;
        const saved = result.origSec - result.outSec;
        updateItem(i, 'done', `${fmtTime(result.origSec)} \u2192 ${fmtTime(result.outSec)}  \u00b7  \u2212${fmtTime(saved)} saved`);
        doneCount++;

        if (total === 1) {
          setWaveformData({ samples: result.samples, padded: result.padded });
          setStats({ origSec: result.origSec, outSec: result.outSec, saved });
        }
      } catch (err) {
        updateItem(i, 'error', (err.message || 'Unknown error').slice(0, 60));
      }
    }

    setOutputBlobs(blobs);
    setProgress({ pct: 100, msg: `Done - ${doneCount} of ${total} file${total > 1 ? 's' : ''} processed` });
    setTimeout(() => setShowProgress(false), 2200);
    setProcessing(false);
  };

  // ── Downloads ──────────────────────────────────────────────
  const downloadSingle = (i) => {
    if (!outputBlobs[i]) return;
    const url  = URL.createObjectURL(outputBlobs[i]);
    const name = files[i].name.replace(/\.[^.]+$/, '') + '_trimmed.wav';
    Object.assign(document.createElement('a'), { href: url, download: name }).click();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const downloadAll = async () => {
    setZipBusy(true);
    try {
      const zip = new JSZip();
      for (let i = 0; i < outputBlobs.length; i++) {
        if (outputBlobs[i]) {
          zip.file(files[i].name.replace(/\.[^.]+$/, '') + '_trimmed.wav', outputBlobs[i]);
        }
      }
      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 3 } });
      const url  = URL.createObjectURL(blob);
      Object.assign(document.createElement('a'), { href: url, download: 'trimmed_audio.zip' }).click();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      setError('Failed to create ZIP: ' + err.message);
    } finally {
      setZipBusy(false);
    }
  };

  const doneCount = outputBlobs.filter(Boolean).length;
  const isMulti   = files.length > 1;

  // ── Render ─────────────────────────────────────────────────
  return (
    <Box sx={{ background: 'linear-gradient(160deg, #0A0A0A 0%, #111118 55%, #0A0A0A 100%)', minHeight: '100vh', pb: 8, position: 'relative', overflow: 'hidden' }}>
      {/* Ambient colour orbs */}
      <Box sx={{ position: 'fixed', top: '-15%', left: '-8%', width: 620, height: 620, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />
      <Box sx={{ position: 'fixed', bottom: '-18%', right: '-8%', width: 660, height: 660, borderRadius: '50%', background: 'radial-gradient(circle, rgba(226,232,240,0.05) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />
      <Box sx={{ position: 'fixed', top: '38%', right: '14%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(241,245,249,0.04) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />
      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 }, position: 'relative', zIndex: 1 }}>

        {/* ── Header ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 4 }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: '12px',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'primary.main',
            boxShadow: '0 2px 12px rgba(255,255,255,0.06)',
          }}>
            <GraphicEq />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} letterSpacing="-0.4px" lineHeight={1.1}>
              Silence Remover
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Strip silence from audio files in bulk
            </Typography>
          </Box>
          <Box sx={{
            ml: 'auto', display: 'flex', alignItems: 'center', gap: 1,
            background: 'linear-gradient(135deg, rgba(52,211,153,0.18) 0%, rgba(16,185,129,0.10) 100%)',
            border: '1px solid rgba(52,211,153,0.40)',
            backdropFilter: 'blur(12px)',
            borderRadius: '20px', px: 2, py: 1,
            boxShadow: '0 0 16px rgba(52,211,153,0.20), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#34D399', boxShadow: '0 0 6px #34D399', flexShrink: 0,
              animation: 'pulse 2s ease-in-out infinite',
              '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } },
            }} />
            <Lock sx={{ fontSize: 13, color: '#34D399' }} />
            <Typography variant="caption" sx={{ color: '#34D399', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.02em' }}>
              Runs 100% in your browser - nothing uploaded
            </Typography>
          </Box>
        </Box>

        {/* ── Content stack ── */}
        <Stack spacing={1.25}>
          <DropZoneCard onFilesSelected={loadFiles} files={files} />

          {files.length > 0 && (
            <FileQueueCard
              files={files}
              itemStates={itemStates}
              outputBlobs={outputBlobs}
              onDownload={downloadSingle}
            />
          )}

          <SettingsCard settings={settings} onChange={setSettings} />

          {waveformData && <WaveformCard waveformData={waveformData} />}
          {stats         && <StatsRow stats={stats} />}

          {/* Progress */}
          {showProgress && (
            <Box sx={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2, p: '16px 22px', boxShadow: '0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">{progress.msg}</Typography>
                <Typography variant="body2" fontWeight={700} color="primary.main">{progress.pct}%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={progress.pct} />
            </Box>
          )}

          {/* Error */}
          {error && <Alert severity="error">{error}</Alert>}

          {/* Process */}
          <Button
            variant="contained"
            size="large"
            fullWidth
            disabled={!files.length || processing}
            startIcon={<AutoFixHigh />}
            onClick={processAll}
            sx={{ py: 1.8, fontSize: '0.95rem', fontWeight: 700 }}
          >
            {processing ? 'Processing…' : 'Remove Silence'}
          </Button>

          {/* Single file download */}
          {doneCount > 0 && !isMulti && (
            <Button
              variant="outlined"
              size="large"
              fullWidth
              startIcon={<Download />}
              onClick={() => downloadSingle(0)}
              sx={{
                py: 1.8, fontWeight: 700,
                borderColor: 'rgba(52,211,153,0.30)', color: 'success.main',
                background: 'rgba(52,211,153,0.07)',
                backdropFilter: 'blur(12px)',
                '&:hover': { background: 'rgba(52,211,153,0.14)', borderColor: 'success.main', boxShadow: '0 4px 20px rgba(52,211,153,0.20)' },
              }}
            >
              Download Trimmed File
            </Button>
          )}

          {/* Bulk ZIP download */}
          {doneCount > 0 && isMulti && (
            <Button
              variant="outlined"
              size="large"
              fullWidth
              disabled={zipBusy}
              startIcon={<FolderZip />}
              onClick={downloadAll}
              sx={{
                py: 1.8, fontWeight: 700,
                borderColor: 'rgba(255,255,255,0.22)',
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(12px)',
                '&:hover': { background: 'rgba(255,255,255,0.10)', borderColor: 'primary.main', boxShadow: '0 4px 20px rgba(255,255,255,0.12)' },
              }}
            >
              {zipBusy
                ? 'Creating ZIP\u2026'
                : `Download as ZIP - ${doneCount} file${doneCount > 1 ? 's' : ''}`}
            </Button>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
