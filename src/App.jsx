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
    setProgress({ pct: 100, msg: `Done \u2014 ${doneCount} of ${total} file${total > 1 ? 's' : ''} processed` });
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
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 8 }}>
      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>

        {/* ── Header ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 4 }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: '12px',
            bgcolor: 'rgba(124,111,247,0.12)',
            border: '1px solid rgba(124,111,247,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'primary.main',
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
            ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.75,
            bgcolor: 'rgba(52,211,153,0.10)',
            border: '1px solid rgba(52,211,153,0.22)',
            borderRadius: '20px', px: 1.5, py: 0.7,
          }}>
            <Lock sx={{ fontSize: 14, color: 'success.main' }} />
            <Typography variant="caption" color="success.main" fontWeight={600}>
              100% local — nothing uploaded
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
            <Box sx={{ bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2, p: '16px 22px' }}>
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
                borderColor: 'rgba(52,211,153,0.4)', color: 'success.main',
                bgcolor: 'rgba(52,211,153,0.08)',
                '&:hover': { bgcolor: 'rgba(52,211,153,0.14)', borderColor: 'success.main' },
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
                borderColor: 'rgba(124,111,247,0.4)',
                bgcolor: 'rgba(124,111,247,0.08)',
                '&:hover': { bgcolor: 'rgba(124,111,247,0.14)', borderColor: 'primary.main' },
              }}
            >
              {zipBusy
                ? 'Creating ZIP\u2026'
                : `Download as ZIP \u2014 ${doneCount} file${doneCount > 1 ? 's' : ''}`}
            </Button>
          )}
        </Stack>
      </Container>
    </Box>
  );
}
