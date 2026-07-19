import React from 'react';
import { Box, Typography, LinearProgress, Stack } from '@mui/material';
import { Movie, AutoFixHigh } from '@mui/icons-material';

export default function VideoProcessingCard({ batchItems, currentlyProcessingItem }) {
  const completedCount = batchItems.filter((i) => i.status === 'done').length;
  const totalCount = batchItems.length;
  const progressPercent = currentlyProcessingItem?.progress?.percent || 0;
  const stage = currentlyProcessingItem?.progress?.stage || 'trimming';

  const stageLabelMap = {
    'loading-engine': 'Initializing FFmpeg Video Engine…',
    trimming: `Trimming frame-accurate cuts (${progressPercent}%)`,
    concatenating: 'Stitching video segments together…',
    done: 'Finished processing clip!',
  };

  return (
    <Box
      sx={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 2,
        p: '24px 28px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      <Stack spacing={2} alignItems="center" textAlign="center">
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.16)',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            color: 'primary.main',
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%, 100%': { transform: 'scale(1)', opacity: 1 },
              '50%': { transform: 'scale(1.08)', opacity: 0.8 },
            },
          }}
        >
          <AutoFixHigh sx={{ fontSize: 30 }} />
        </Box>

        <Box>
          <Typography variant="h6" fontWeight={700}>
            Processing Video Batch ({completedCount} / {totalCount} Complete)
          </Typography>
          {currentlyProcessingItem ? (
            <Typography variant="body2" color="primary.main" fontWeight={600} sx={{ mt: 0.5 }}>
              Currently cutting: {currentlyProcessingItem.file.name}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Preparing video files for processing…
            </Typography>
          )}
        </Box>

        <Box sx={{ width: '100%', mt: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {stageLabelMap[stage] || 'Processing video…'}
            </Typography>
            <Typography variant="body2" fontWeight={700} color="primary.main">
              {progressPercent}%
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={progressPercent} sx={{ height: 8, borderRadius: 4 }} />
        </Box>

        <Typography variant="caption" color="text.disabled">
          ⚡ All video cutting happens 100% client-side inside your browser via WebAssembly.
        </Typography>
      </Stack>
    </Box>
  );
}
