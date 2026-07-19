import React, { useState, useCallback } from 'react';
import {
  Box, Typography, Button, LinearProgress, Alert, Stack,
} from '@mui/material';
import {
  AutoFixHigh, Download, FolderZip,
} from '@mui/icons-material';
import JSZip from 'jszip';

import DropZoneCard from '../DropZoneCard';
import FileQueueCard from '../FileQueueCard';
import SettingsCard from '../SettingsCard';
import WaveformCard from '../WaveformCard';
import StatsRow from '../StatsRow';
import { processSingleFile, fmtTime } from '../../utils/audioUtils';

const INITIAL_SETTINGS = { threshold: -40, minSilence: 300, padding: 50 };

export default function AudioSilenceRemover() {
  const [files, setFiles] = useState([]);
  const [outputBlobs, setOutputBlobs] = useState([]);
  const [itemStates, setItemStates] = useState([]);
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ pct: 0, msg: '' });
  const [showProgress, setShowProgress] = useState(false);
  const [waveformData, setWaveformData] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [zipBusy, setZipBusy] = useState(false);

  // File selection
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
          const ac = new AudioContext();
          const buf = await ac.decodeAudioData(await arr[0].arrayBuffer());
          await ac.close();
          setWaveformData({ samples: buf.getChannelData(0), padded: null });
        } catch {}
      })();
    }
  }, []);

  const updateItem = (i, state, sub) => {
    setItemStates((prev) => {
      const next = [...prev];
      next[i] = { state, sub: sub ?? prev[i]?.sub ?? '' };
      return next;
    });
  };

  // Processing
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
      updateItem(i, 'processing', 'Processing…');
      setProgress({ pct: Math.round((i / total) * 100), msg: `Processing file ${i + 1} of ${total}` });

      try {
        const result = await processSingleFile(files[i], settings);
        blobs[i] = result.blob;
        const saved = result.origSec - result.outSec;
        updateItem(
          i,
          'done',
          `${fmtTime(result.origSec)} → ${fmtTime(result.outSec)}  ·  −${fmtTime(saved)} saved`
        );
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

  // Downloads
  const downloadSingle = (i) => {
    if (!outputBlobs[i]) return;
    const url = URL.createObjectURL(outputBlobs[i]);
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
      const url = URL.createObjectURL(blob);
      Object.assign(document.createElement('a'), { href: url, download: 'trimmed_audio.zip' }).click();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      setError('Failed to create ZIP: ' + err.message);
    } finally {
      setZipBusy(false);
    }
  };

  const doneCount = outputBlobs.filter(Boolean).length;
  const isMulti = files.length > 1;

  return (
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
      {stats && <StatsRow stats={stats} />}

      {/* Progress */}
      {showProgress && (
        <Box
          sx={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 2,
            p: '16px 22px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {progress.msg}
            </Typography>
            <Typography variant="body2" fontWeight={700} color="primary.main">
              {progress.pct}%
            </Typography>
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
            py: 1.8,
            fontWeight: 700,
            borderColor: 'rgba(52,211,153,0.30)',
            color: 'success.main',
            background: 'rgba(52,211,153,0.07)',
            backdropFilter: 'blur(12px)',
            '&:hover': {
              background: 'rgba(52,211,153,0.14)',
              borderColor: 'success.main',
              boxShadow: '0 4px 20px rgba(52,211,153,0.20)',
            },
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
            py: 1.8,
            fontWeight: 700,
            borderColor: 'rgba(255,255,255,0.22)',
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(12px)',
            '&:hover': {
              background: 'rgba(255,255,255,0.10)',
              borderColor: 'primary.main',
              boxShadow: '0 4px 20px rgba(255,255,255,0.12)',
            },
          }}
        >
          {zipBusy
            ? 'Creating ZIP…'
            : `Download as ZIP - ${doneCount} file${doneCount > 1 ? 's' : ''}`}
        </Button>
      )}
    </Stack>
  );
}
