import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { QueueMusic, AudioFile, Sync, CheckCircle, Cancel, Download } from '@mui/icons-material';
import { fmtBytes, shortName } from '../utils/audioUtils';

const STATE_CFG = {
  queued: { label: 'QUEUED', iconName: 'audio', color: '#475569', bg: '#18181D', border: '#2F2F38' },
  processing: { label: 'PROCESSING', iconName: 'sync', color: '#00E5FF', bg: '#262630', border: '#00E5FF' },
  done: { label: 'COMPLETE', iconName: 'check', color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: '#10B981' },
  error: { label: 'FAILED', iconName: 'cancel', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: '#EF4444' },
};

function StateIcon({ iconName }) {
  const sx = { fontSize: 18, display: 'block' };
  if (iconName === 'sync') return <Sync sx={{ ...sx, animation: 'spin 0.75s linear infinite' }} />;
  if (iconName === 'check') return <CheckCircle sx={sx} />;
  if (iconName === 'cancel') return <Cancel sx={sx} />;
  return <AudioFile sx={sx} />;
}

export default function FileQueueCard({ files, itemStates, outputBlobs, onDownload }) {
  return (
    <Box
      sx={{
        background: '#1E1E24',
        border: '1px solid #2F2F38',
        borderRadius: '12px',
        p: '20px 22px',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <QueueMusic sx={{ fontSize: 16, color: '#00E5FF' }} />
        <Typography
          variant="caption"
          fontWeight={700}
          textTransform="uppercase"
          letterSpacing={0.8}
          sx={{ color: '#00E5FF', fontFamily: '"JetBrains Mono", monospace' }}
        >
          [QUEUE_NODE] BATCH_STREAM
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {files.map((file, i) => {
          const { state = 'queued', sub = '' } = itemStates[i] || {};
          const cfg = STATE_CFG[state] || STATE_CFG.queued;
          const hasBlob = Boolean(outputBlobs[i]);

          return (
            <Box
              key={i}
              sx={{
                display: 'grid',
                gridTemplateColumns: '36px 1fr auto auto',
                alignItems: 'center',
                gap: 1.5,
                p: '10px 14px',
                bgcolor: '#0E121B',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: cfg.border,
              }}
            >
              {/* State icon */}
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '6px',
                  flexShrink: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: cfg.bg,
                  color: cfg.color,
                }}
              >
                <StateIcon iconName={cfg.iconName} />
              </Box>

              {/* Name + sub */}
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} noWrap title={file.name} color="#F1F5F9" sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.82rem' }}>
                  {shortName(file.name)}
                </Typography>
                <Typography variant="caption" color="text.disabled" sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.68rem' }}>
                  {sub || fmtBytes(file.size)}
                </Typography>
              </Box>

              {/* Badge */}
              <Box
                sx={{
                  fontSize: '0.65rem',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontWeight: 700,
                  px: 1.2,
                  py: 0.3,
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                  bgcolor: cfg.bg,
                  color: cfg.color,
                  border: `1px solid ${cfg.border}`,
                }}
              >
                {cfg.label}
              </Box>

              {/* Per-file download */}
              <IconButton
                size="small"
                disabled={!hasBlob}
                onClick={() => onDownload(i)}
                title="Download trimmed WAV"
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '6px',
                  border: '1px solid #1E2638',
                  color: hasBlob ? '#10B981' : 'text.disabled',
                  opacity: hasBlob ? 1 : 0,
                  pointerEvents: hasBlob ? 'auto' : 'none',
                  '&:hover': { bgcolor: 'rgba(16,185,129,0.15)', borderColor: '#10B981' },
                }}
              >
                <Download sx={{ fontSize: 16, display: 'block' }} />
              </IconButton>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
