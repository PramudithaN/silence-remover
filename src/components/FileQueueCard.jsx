import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { QueueMusic, AudioFile, Sync, CheckCircle, Cancel, Download } from '@mui/icons-material';
import { fmtBytes, shortName } from '../utils/audioUtils';

const STATE_CFG = {
  queued:     { label: 'Queued',       iconName: 'audio',   color: '#4E4E68', bg: 'rgba(255,255,255,0.04)',  border: 'rgba(255,255,255,0.06)' },
  processing: { label: 'Processing…',  iconName: 'sync',    color: '#7C6FF7', bg: 'rgba(124,111,247,0.12)', border: 'rgba(124,111,247,0.28)' },
  done:       { label: 'Done',         iconName: 'check',   color: '#34D399', bg: 'rgba(52,211,153,0.10)',  border: 'rgba(52,211,153,0.22)'  },
  error:      { label: 'Failed',       iconName: 'cancel',  color: '#F87171', bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.22)' },
};

function StateIcon({ iconName }) {
  const sx = { fontSize: 20 };
  if (iconName === 'sync')   return <Sync   sx={{ ...sx, animation: 'spin 0.75s linear infinite' }} />;
  if (iconName === 'check')  return <CheckCircle sx={sx} />;
  if (iconName === 'cancel') return <Cancel sx={sx} />;
  return <AudioFile sx={sx} />;
}

export default function FileQueueCard({ files, itemStates, outputBlobs, onDownload }) {
  return (
    <Box sx={{ bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2, p: '20px 22px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <QueueMusic sx={{ fontSize: 15, color: 'text.disabled' }} />
        <Typography variant="caption" fontWeight={600} textTransform="uppercase" letterSpacing={0.7} color="text.disabled">
          File Queue
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {files.map((file, i) => {
          const { state = 'queued', sub = '' } = itemStates[i] || {};
          const cfg = STATE_CFG[state] || STATE_CFG.queued;
          const hasBlob = Boolean(outputBlobs[i]);

          return (
            <Box key={i} sx={{
              display: 'grid',
              gridTemplateColumns: '40px 1fr auto auto',
              alignItems: 'center', gap: 1.5,
              p: '11px 14px',
              bgcolor: 'rgba(255,255,255,0.02)',
              borderRadius: 2,
              border: '1px solid',
              borderColor: cfg.border,
              transition: 'border-color 0.2s',
            }}>
              {/* State icon */}
              <Box sx={{
                width: 40, height: 40, borderRadius: 1.5, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: cfg.bg, color: cfg.color,
              }}>
                <StateIcon iconName={cfg.iconName} />
              </Box>

              {/* Name + sub */}
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={500} noWrap title={file.name}>
                  {shortName(file.name)}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  {sub || fmtBytes(file.size)}
                </Typography>
              </Box>

              {/* Badge */}
              <Box sx={{
                fontSize: '0.69rem', fontWeight: 700, px: 1.25, py: 0.4,
                borderRadius: '20px', whiteSpace: 'nowrap',
                bgcolor: cfg.bg, color: cfg.color,
                border: `1px solid ${cfg.border}`,
              }}>
                {cfg.label}
              </Box>

              {/* Per-file download */}
              <IconButton
                size="small"
                disabled={!hasBlob}
                onClick={() => onDownload(i)}
                title="Download this file"
                sx={{
                  width: 34, height: 34, borderRadius: 1.5,
                  border: '1px solid rgba(255,255,255,0.10)',
                  color: hasBlob ? 'success.main' : 'text.disabled',
                  opacity: hasBlob ? 1 : 0,
                  pointerEvents: hasBlob ? 'auto' : 'none',
                  '&:hover': { bgcolor: 'rgba(52,211,153,0.1)' },
                }}
              >
                <Download sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
