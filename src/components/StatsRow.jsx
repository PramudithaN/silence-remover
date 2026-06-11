import React from 'react';
import { Box, Typography } from '@mui/material';
import { Schedule, Compress, Bolt } from '@mui/icons-material';
import { fmtTime } from '../utils/audioUtils';

export default function StatsRow({ stats }) {
  const items = [
    { Icon: Schedule, value: fmtTime(stats.origSec), label: 'Original',   highlight: false },
    { Icon: Compress, value: fmtTime(stats.outSec),  label: 'Output',     highlight: false },
    { Icon: Bolt,     value: fmtTime(stats.saved),   label: 'Time Saved', highlight: true  },
  ];

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1 }}>
      {items.map(({ Icon, value, label, highlight }) => (
        <Box key={label} sx={{
          textAlign: 'center', p: '14px 16px', borderRadius: 2,
          bgcolor: highlight ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.03)',
          border: '1px solid',
          borderColor: highlight ? 'rgba(52,211,153,0.22)' : 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          boxShadow: highlight ? '0 4px 20px rgba(52,211,153,0.12)' : '0 2px 12px rgba(0,0,0,0.2)',
        }}>
          <Icon sx={{ fontSize: 20, color: highlight ? 'success.main' : 'text.disabled', mb: 0.75 }} />
          <Typography variant="h6" fontWeight={700} lineHeight={1}
            color={highlight ? 'success.main' : 'primary.light'}>
            {value}
          </Typography>
          <Typography variant="caption" color="text.disabled" textTransform="uppercase"
            letterSpacing={0.5} fontWeight={600} display="block" mt={0.5}>
            {label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
