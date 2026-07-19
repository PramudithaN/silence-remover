import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Slider,
  Chip,
  IconButton,
  Stack,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  VideoLibrary,
  Tune,
  GraphicEq,
  Delete,
  Add,
  ContentCut,
  RestartAlt,
  PlayArrow,
  Movie,
} from '@mui/icons-material';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';

function formatTime(t) {
  if (!t || isNaN(t)) return '0:00.0';
  const m = Math.floor(t / 60);
  const s = (t % 60).toFixed(1);
  return `${m}:${s.padStart(4, '0')}`;
}

export default function VideoBatchReview({
  batchItems,
  settings,
  cutMode,
  onCutModeChange,
  onToggleSegment,
  onSettingsChange,
  onRemoveItem,
  onAddMoreFiles,
  onConfirmBatch,
  onCancel,
}) {
  const [activeItemId, setActiveItemId] = useState(batchItems[0]?.id || '');
  const activeItem = batchItems.find((item) => item.id === activeItemId) || batchItems[0];

  const waveformRef = useRef(null);
  const wsRef = useRef(null);
  const regionsRef = useRef(null);
  const videoRef = useRef(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [localThreshold, setLocalThreshold] = useState(settings.thresholdDb);
  const [localMinDuration, setLocalMinDuration] = useState(settings.minSilenceDuration);

  // Sync video URL
  useEffect(() => {
    if (!activeItem?.file) return;
    const url = URL.createObjectURL(activeItem.file);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [activeItem?.file]);

  // Redraw regions
  const drawRegions = () => {
    const regions = regionsRef.current;
    if (!regions || !activeItem) return;
    regions.clearRegions();
    activeItem.segments.forEach((seg) => {
      regions.addRegion({
        id: seg.id,
        start: seg.start,
        end: seg.end,
        color: seg.keepForRemoval
          ? 'rgba(239, 68, 68, 0.45)'
          : 'rgba(148, 163, 184, 0.25)',
        drag: false,
        resize: false,
      });
    });
  };

  // Initialize WaveSurfer
  useEffect(() => {
    if (!waveformRef.current || !activeItem?.file) return;

    const regions = RegionsPlugin.create();
    const objectUrl = URL.createObjectURL(activeItem.file);

    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: 'rgba(255, 255, 255, 0.3)',
      progressColor: '#38bdf8',
      height: 85,
      normalize: true,
      plugins: [regions],
    });

    ws.load(objectUrl);
    wsRef.current = ws;
    regionsRef.current = regions;

    const handleReady = () => {
      regions.clearRegions();
      activeItem.segments.forEach((seg) => {
        regions.addRegion({
          id: seg.id,
          start: seg.start,
          end: seg.end,
          color: seg.keepForRemoval
            ? 'rgba(239, 68, 68, 0.45)'
            : 'rgba(148, 163, 184, 0.25)',
          drag: false,
          resize: false,
        });
      });
    };

    ws.on('ready', handleReady);
    ws.on('decode', handleReady);

    const unbindClick = regions.on('region-clicked', (region, e) => {
      e.stopPropagation();
      if (videoRef.current) {
        videoRef.current.currentTime = region.start;
      }
      onToggleSegment(activeItem.id, region.id);
    });

    return () => {
      unbindClick?.();
      ws.destroy();
      URL.revokeObjectURL(objectUrl);
    };
  }, [activeItem?.id, activeItem?.file]);

  useEffect(() => {
    drawRegions();
  }, [activeItem?.segments]);

  const totalSegmentsToRemove = batchItems.reduce(
    (acc, item) => acc + item.segments.filter((s) => s.keepForRemoval).length,
    0
  );

  const totalSavedSeconds = batchItems.reduce((acc, item) => {
    return (
      acc +
      item.segments
        .filter((s) => s.keepForRemoval)
        .reduce((sAcc, s) => sAcc + (s.end - s.start), 0)
    );
  }, 0);

  const totalBatchDuration = batchItems.reduce(
    (acc, item) => acc + item.duration,
    0
  );

  const handleAddFilesInput = (e) => {
    const files = Array.from(e.target.files || []).filter(
      (f) => f.type.startsWith('video/') || /\.(mp4|mov|webm|mkv|avi)$/i.test(f.name)
    );
    if (files.length > 0) onAddMoreFiles(files);
  };

  return (
    <Stack spacing={2.5}>
      {/* Summary Header Card */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.15) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          borderRadius: 2,
          p: '20px 24px',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700} color="text.primary">
            Batch Video Review ({batchItems.length}{' '}
            {batchItems.length === 1 ? 'Video' : 'Videos'})
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Removing <strong>{totalSegmentsToRemove}</strong> silent parts across clips · Saving{' '}
            <Box component="span" color="primary.main" fontWeight={700}>
              {formatTime(totalSavedSeconds)}
            </Box>{' '}
            of {formatTime(totalBatchDuration)} total duration
          </Typography>
        </Box>
        <Button
          variant="outlined"
          component="label"
          startIcon={<Add sx={{ fontSize: 18, display: 'block' }} />}
          size="small"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justify: 'center',
            textTransform: 'none',
            fontWeight: 600,
            borderColor: 'rgba(255,255,255,0.2)',
            color: 'text.primary',
            '&:hover': { borderColor: 'primary.main', background: 'rgba(255,255,255,0.08)' },
          }}
        >
          Add More Videos
          <input
            type="file"
            accept="video/*"
            multiple
            hidden
            onChange={handleAddFilesInput}
          />
        </Button>
      </Box>

      {/* Video File Tabs */}
      <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5 }}>
        {batchItems.map((item, idx) => {
          const removedCount = item.segments.filter((s) => s.keepForRemoval).length;
          const isSelected = item.id === activeItem?.id;
          return (
            <Box
              key={item.id}
              onClick={() => setActiveItemId(item.id)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 1,
                borderRadius: '10px',
                cursor: 'pointer',
                border: '1px solid',
                borderColor: isSelected ? 'primary.main' : 'rgba(255,255,255,0.1)',
                background: isSelected ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s',
                minWidth: 'fit-content',
                '&:hover': { background: 'rgba(255,255,255,0.08)' },
              }}
            >
              <Movie sx={{ fontSize: 16, color: isSelected ? 'primary.main' : 'text.secondary' }} />
              <Typography variant="body2" fontWeight={isSelected ? 700 : 500} noWrap sx={{ maxWidth: 160 }}>
                #{idx + 1} {item.file.name}
              </Typography>
              <Chip
                label={removedCount}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  bgcolor: 'rgba(239, 68, 68, 0.2)',
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}
              />
              {batchItems.length > 1 && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveItem(item.id);
                  }}
                  sx={{ p: 0.2, color: 'text.secondary', '&:hover': { color: '#f87171' } }}
                >
                  <Delete sx={{ fontSize: 15 }} />
                </IconButton>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Video Preview & Settings Card */}
      {activeItem && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 2.5,
          }}
        >
          {/* Video Player */}
          <Box
            sx={{
              background: 'rgba(0,0,0,0.6)',
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              aspectRatio: '16/9',
            }}
          >
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </Box>

          {/* Controls Panel */}
          <Box
            sx={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 2,
              p: '20px 22px',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Tune sx={{ fontSize: 16, color: 'text.disabled' }} />
                <Typography variant="caption" fontWeight={600} textTransform="uppercase" letterSpacing={0.7} color="text.disabled">
                  Silence Detection Settings
                </Typography>
              </Box>

              {/* Threshold Slider */}
              <Box sx={{ mb: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">Silence Threshold</Typography>
                  <Typography variant="body2" fontWeight={700} color="primary.main">{localThreshold} dB</Typography>
                </Box>
                <Slider
                  min={-60}
                  max={-15}
                  value={localThreshold}
                  onChange={(e, val) => setLocalThreshold(val)}
                  onChangeCommitted={(e, val) => onSettingsChange({ ...settings, thresholdDb: val })}
                  size="small"
                />
                <Typography variant="caption" color="text.disabled">
                  Lower dB = stricter silence detection. Higher dB = catches background hums.
                </Typography>
              </Box>

              {/* Min Duration Slider */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">Minimum Silence Length</Typography>
                  <Typography variant="body2" fontWeight={700} color="primary.main">{localMinDuration.toFixed(2)}s</Typography>
                </Box>
                <Slider
                  min={0.05}
                  max={2}
                  step={0.05}
                  value={localMinDuration}
                  onChange={(e, val) => setLocalMinDuration(val)}
                  onChangeCommitted={(e, val) => onSettingsChange({ ...settings, minSilenceDuration: val })}
                  size="small"
                />
                <Typography variant="caption" color="text.disabled">
                  Pauses shorter than this duration are kept as natural speech gaps.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 1.5, p: 1.5, mt: 1 }}>
              <Typography variant="body2" fontWeight={700} noWrap color="text.primary">
                {activeItem.file.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Found <strong>{activeItem.segments.filter((s) => s.keepForRemoval).length}</strong> silent segments marked for removal (Red zones)
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Waveform Visualization Card */}
      <Box
        sx={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 2,
          p: '20px 22px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GraphicEq sx={{ fontSize: 16, color: 'text.disabled' }} />
            <Typography variant="caption" fontWeight={600} textTransform="uppercase" letterSpacing={0.7} color="text.disabled">
              Audio Waveform {activeItem?.file.name}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Box component="span" sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: 'rgba(239, 68, 68, 0.7)' }} />
              Red = Silence (ToRemove)
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <Box component="span" sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: 'rgba(148, 163, 184, 0.4)' }} />
              Gray = Speech (Keep)
            </Typography>
          </Box>
        </Box>

        <Box ref={waveformRef} sx={{ cursor: 'pointer', borderRadius: 1.5, overflow: 'hidden', bg: 'rgba(0,0,0,0.2)' }} />
        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 1 }}>
          💡 Click any red region on the waveform to jump the video player to that timestamp or toggle silence removal.
        </Typography>
      </Box>

      {/* Segments Inspector List */}
      <Box
        sx={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ px: 2.5, py: 1.8, borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
          <Typography variant="subtitle2" fontWeight={700}>
            Detected Silence Segments ({activeItem?.segments.length || 0})
          </Typography>
        </Box>

        <Box sx={{ maxHeight: 220, overflowY: 'auto' }}>
          {activeItem?.segments.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2.5 }}>
              No silent segments detected for this video with current settings. Try increasing the silence threshold slider.
            </Typography>
          )}

          {activeItem?.segments.map((seg, idx) => (
            <Box
              key={seg.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                px: 2.5,
                py: 1.2,
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                '&:hover': { background: 'rgba(255,255,255,0.03)' },
              }}
            >
              <Button
                variant="text"
                size="small"
                startIcon={<PlayArrow sx={{ fontSize: 14 }} />}
                onClick={() => {
                  if (videoRef.current) videoRef.current.currentTime = seg.start;
                }}
                sx={{ color: 'text.primary', textTransform: 'none', fontWeight: 600 }}
              >
                #{idx + 1}: {formatTime(seg.start)} – {formatTime(seg.end)}{' '}
                <Box component="span" color="text.secondary" fontWeight={400} sx={{ ml: 1 }}>
                  ({(seg.end - seg.start).toFixed(2)}s)
                </Box>
              </Button>

              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={seg.keepForRemoval}
                    onChange={() => onToggleSegment(activeItem.id, seg.id)}
                    sx={{ color: 'rgba(255,255,255,0.3)', '&.Mui-checked': { color: 'primary.main' } }}
                  />
                }
                label={<Typography variant="body2" fontWeight={500}>Remove silence</Typography>}
              />
            </Box>
          ))}
        </Box>
      </Box>

      {/* Action Footer */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1, gap: 2 }}>
        <Button
          variant="outlined"
          size="large"
          startIcon={<RestartAlt sx={{ fontSize: 20, display: 'block' }} />}
          onClick={onCancel}
          sx={{
            py: 1.4,
            px: 3,
            display: 'inline-flex',
            alignItems: 'center',
            justify: 'center',
            textTransform: 'none',
            borderColor: 'rgba(255,255,255,0.2)',
            color: 'text.secondary',
            fontWeight: 600,
            '&:hover': { borderColor: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)' },
          }}
        >
          Start Over
        </Button>

        <Button
          variant="contained"
          size="large"
          startIcon={<ContentCut sx={{ fontSize: 20, display: 'block' }} />}
          disabled={totalSegmentsToRemove === 0}
          onClick={onConfirmBatch}
          sx={{
            py: 1.4,
            px: 4,
            display: 'inline-flex',
            alignItems: 'center',
            justify: 'center',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.95rem',
          }}
        >
          Cut All {batchItems.length} {batchItems.length === 1 ? 'Video' : 'Videos'}
        </Button>
      </Box>
    </Stack>
  );
}
