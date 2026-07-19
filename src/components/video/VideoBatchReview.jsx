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
      waveColor: '#475569',
      progressColor: '#00E5FF',
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
      {/* Node Studio Header Box */}
      <Box
        sx={{
          background: '#121620',
          border: '1px solid #A855F7',
          borderRadius: '12px',
          p: '20px 24px',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700} color="#F1F5F9">
            Batch Video Review ({batchItems.length}{' '}
            {batchItems.length === 1 ? 'Video' : 'Videos'})
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontFamily: '"JetBrains Mono", monospace' }}>
            Removing <strong style={{ color: '#EF4444' }}>{totalSegmentsToRemove}</strong> silent parts · Saving{' '}
            <Box component="span" color="#00E5FF" fontWeight={700}>
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
            justifyContent: 'center',
            textTransform: 'none',
            fontWeight: 700,
            borderColor: '#1E2638',
            background: '#181E2C',
            color: '#A855F7',
            '&:hover': { borderColor: '#A855F7', background: 'rgba(168,85,247,0.1)' },
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

      {/* Video Item Tabs */}
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
                py: 0.8,
                borderRadius: '8px',
                cursor: 'pointer',
                border: '1px solid',
                borderColor: isSelected ? '#00E5FF' : '#1E2638',
                background: isSelected ? '#1A2130' : '#121620',
                transition: 'all 0.15s ease',
                minWidth: 'fit-content',
                '&:hover': { background: '#1A2130' },
              }}
            >
              <Movie sx={{ fontSize: 16, color: isSelected ? '#00E5FF' : '#475569' }} />
              <Typography variant="body2" fontWeight={isSelected ? 700 : 500} noWrap sx={{ maxWidth: 150, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.8rem' }}>
                #{idx + 1} {item.file.name}
              </Typography>
              <Chip
                label={removedCount}
                size="small"
                sx={{
                  height: 18,
                  fontSize: '0.65rem',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontWeight: 700,
                  bgcolor: 'rgba(239, 68, 68, 0.15)',
                  color: '#EF4444',
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
                  sx={{ p: 0.2, color: '#475569', '&:hover': { color: '#EF4444' } }}
                >
                  <Delete sx={{ fontSize: 14 }} />
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
            gap: 2,
          }}
        >
          {/* Video Player Box */}
          <Box
            sx={{
              background: '#090B0E',
              borderRadius: '10px',
              overflow: 'hidden',
              border: '1px solid #1E2638',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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

          {/* Controls Node Panel */}
          <Box
            sx={{
              background: '#121620',
              border: '1px solid #1E2638',
              borderRadius: '10px',
              p: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Tune sx={{ fontSize: 16, color: '#00E5FF' }} />
                <Typography variant="caption" fontWeight={700} textTransform="uppercase" letterSpacing={0.8} sx={{ color: '#00E5FF', fontFamily: '"JetBrains Mono", monospace' }}>
                  [NODE_PARAMS] THRESHOLD_SETTINGS
                </Typography>
              </Box>

              {/* Threshold Slider */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">Silence Threshold</Typography>
                  <Typography variant="caption" fontWeight={700} color="#00E5FF" sx={{ fontFamily: '"JetBrains Mono", monospace' }}>{localThreshold} dB</Typography>
                </Box>
                <Slider
                  min={-60}
                  max={-15}
                  value={localThreshold}
                  onChange={(e, val) => setLocalThreshold(val)}
                  onChangeCommitted={(e, val) => onSettingsChange({ ...settings, thresholdDb: val })}
                  size="small"
                />
              </Box>

              {/* Min Duration Slider */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">Min Silence Length</Typography>
                  <Typography variant="caption" fontWeight={700} color="#00E5FF" sx={{ fontFamily: '"JetBrains Mono", monospace' }}>{localMinDuration.toFixed(2)}s</Typography>
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
              </Box>
            </Box>

            <Box sx={{ background: '#0E121B', border: '1px solid #1E2638', borderRadius: '6px', p: 1.2 }}>
              <Typography variant="body2" fontWeight={700} noWrap color="#F1F5F9">
                {activeItem.file.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.7rem' }}>
                Found <strong style={{ color: '#EF4444' }}>{activeItem.segments.filter((s) => s.keepForRemoval).length}</strong> silent segments marked for removal
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Waveform Box */}
      <Box
        sx={{
          background: '#121620',
          border: '1px solid #1E2638',
          borderRadius: '10px',
          p: '18px 20px',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GraphicEq sx={{ fontSize: 16, color: '#00E5FF' }} />
            <Typography variant="caption" fontWeight={700} textTransform="uppercase" letterSpacing={0.8} sx={{ color: '#00E5FF', fontFamily: '"JetBrains Mono", monospace' }}>
              WAVEFORM :: {activeItem?.file.name}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.8, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.7rem' }}>
              <Box component="span" sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: '#EF4444' }} />
              Red = Silence (Cut)
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.8, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.7rem' }}>
              <Box component="span" sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: '#475569' }} />
              Gray = Speech (Keep)
            </Typography>
          </Box>
        </Box>

        <Box ref={waveformRef} sx={{ cursor: 'pointer', borderRadius: '6px', overflow: 'hidden', background: '#090B0E', border: '1px solid #1A2130' }} />
      </Box>

      {/* Segments Inspector List */}
      <Box
        sx={{
          background: '#121620',
          border: '1px solid #1E2638',
          borderRadius: '10px',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid #1E2638', background: '#0E121B' }}>
          <Typography variant="subtitle2" fontWeight={700} color="#F1F5F9">
            Detected Silence Segments ({activeItem?.segments.length || 0})
          </Typography>
        </Box>

        <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
          {activeItem?.segments.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2.5, fontFamily: '"JetBrains Mono", monospace' }}>
              No silent segments detected for this video with current parameters.
            </Typography>
          )}

          {activeItem?.segments.map((seg, idx) => (
            <Box
              key={seg.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 2.5,
                py: 1,
                borderBottom: '1px solid #1A2130',
                '&:hover': { background: '#171D2B' },
              }}
            >
              <Button
                variant="text"
                size="small"
                startIcon={<PlayArrow sx={{ fontSize: 14, display: 'block', color: '#00E5FF' }} />}
                onClick={() => {
                  if (videoRef.current) videoRef.current.currentTime = seg.start;
                }}
                sx={{ color: '#F1F5F9', textTransform: 'none', fontWeight: 600, fontFamily: '"JetBrains Mono", monospace', fontSize: '0.8rem' }}
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
                    sx={{ color: '#475569', '&.Mui-checked': { color: '#00E5FF' } }}
                  />
                }
                label={<Typography variant="caption" fontWeight={600} sx={{ fontFamily: '"JetBrains Mono", monospace', color: '#94A3B8' }}>Remove silence</Typography>}
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
          startIcon={<RestartAlt sx={{ fontSize: 18, display: 'block' }} />}
          onClick={onCancel}
          sx={{
            py: 1.3,
            px: 3,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            textTransform: 'none',
            borderColor: '#1E2638',
            background: '#121620',
            color: 'text.secondary',
            fontWeight: 700,
            '&:hover': { borderColor: '#94A3B8', background: '#1A2130' },
          }}
        >
          Start Over
        </Button>

        <Button
          variant="contained"
          size="large"
          startIcon={<ContentCut sx={{ fontSize: 18, display: 'block' }} />}
          disabled={totalSegmentsToRemove === 0}
          onClick={onConfirmBatch}
          sx={{
            py: 1.3,
            px: 4,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.9rem',
            background: '#00E5FF',
            color: '#050B14',
            '&:hover': { background: '#67F5FF' },
          }}
        >
          Cut All {batchItems.length} {batchItems.length === 1 ? 'Video' : 'Videos'}
        </Button>
      </Box>
    </Stack>
  );
}
