import React from 'react';
import { Box, Typography } from '@mui/material';
import { Schedule, Compress, Bolt } from '@mui/icons-material';
import { fmtTime } from '../utils/audioUtils';

export default function StatsRow({ stats }) {
  const items = [
    { Icon: Schedule, value: fmtTime(stats.origSec), label: 'Original', color: '#94A3B8', bg: '#1E1E24', border: '#2F2F38' },
    { Icon: Compress, value: fmtTime(stats.outSec), label: 'Output', color: '#00E5FF', bg: '#1E1E24', border: '#2F2F38' },
    { Icon: Bolt, value: fmtTime(stats.saved), label: 'Time Saved', color: '#10B981', bg: 'rgba(16,185,129,0.08)', border: '#10B981' },
  ];

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
      {items.map(({ Icon, value, label, color, bg, border }) => (
        <Box
          key={label}
          sx={{
            textAlign: 'center',
            p: '14px 16px',
            borderRadius: '10px',
            bgcolor: bg,
            border: '1px solid',
            borderColor: border,
          }}
        >
          <Icon sx={{ fontSize: 18, color, mb: 0.5, display: 'block', mx: 'auto' }} />
          <Typography
            variant="h6"
            fontWeight={700}
            lineHeight={1}
            sx={{ color, fontFamily: '"JetBrains Mono", monospace' }}
          >
            {value}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            textTransform="uppercase"
            letterSpacing={0.6}
            fontWeight={700}
            display="block"
            mt={0.6}
            sx={{ fontSize: '0.65rem', fontFamily: '"JetBrains Mono", monospace' }}
          >
            {label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
