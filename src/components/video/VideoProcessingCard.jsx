import React from 'react';
import { Box, Typography, LinearProgress, Stack } from '@mui/material';
import { AutoFixHigh } from '@mui/icons-material';

export default function VideoProcessingCard({ batchItems, currentlyProcessingItem }) {
  const completedCount = batchItems.filter((i) => i.status === 'done').length;
  const totalCount = batchItems.length;
  const progressPercent = currentlyProcessingItem?.progress?.percent || 0;
  const stage = currentlyProcessingItem?.progress?.stage || 'trimming';

  const stageLabelMap = {
    'loading-engine': 'Initializing FFmpeg WASM Core Engine…',
    trimming: `Trimming frame-accurate segments (${progressPercent}%)`,
    concatenating: 'Stitching video segments together…',
    done: 'Finished processing clip!',
  };

  return (
    <Box
      sx={{
        background: '#1E1E24',
        border: '1px solid #00E5FF',
        borderRadius: '12px',
        p: '28px 28px',
        position: 'relative',
      }}
    >
      <Stack spacing={2.5} alignItems="center" textAlign="center">
        <Box
          sx={{
            width: 54,
            height: 54,
            borderRadius: '8px',
            background: '#162335',
            border: '1px solid #00E5FF',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#00E5FF',
          }}
        >
          <AutoFixHigh sx={{ fontSize: 26, display: 'block' }} />
        </Box>

        <Box>
          <Typography variant="h6" fontWeight={700} color="#F1F5F9">
            Processing Video Batch ({completedCount} / {totalCount} Complete)
          </Typography>
          {currentlyProcessingItem ? (
            <Typography variant="caption" color="#00E5FF" fontWeight={700} sx={{ mt: 0.5, display: 'block', fontFamily: '"JetBrains Mono", monospace' }}>
              CURRENT_CLIP :: {currentlyProcessingItem.file.name}
            </Typography>
          ) : (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontFamily: '"JetBrains Mono", monospace' }}>
              Preparing video files for execution…
            </Typography>
          )}
        </Box>

        <Box sx={{ width: '100%', mt: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: '"JetBrains Mono", monospace' }}>
              {stageLabelMap[stage] || 'Processing video…'}
            </Typography>
            <Typography variant="caption" fontWeight={700} color="#00E5FF" sx={{ fontFamily: '"JetBrains Mono", monospace' }}>
              {progressPercent}%
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={progressPercent} sx={{ height: 6, borderRadius: 3 }} />
        </Box>

        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.68rem', fontFamily: '"JetBrains Mono", monospace' }}>
          [NODE: FFMPEG_WASM] All video cutting runs 100% client-side inside WebAssembly.
        </Typography>
      </Stack>
    </Box>
  );
}
