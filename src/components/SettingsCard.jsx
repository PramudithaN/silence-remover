import React from 'react';
import { Box, Typography, Slider } from '@mui/material';
import { Tune, VolumeDown, Timer, SpaceBar } from '@mui/icons-material';

const SETTINGS_CONFIG = [
  {
    key: 'threshold',
    label: 'Silence Threshold',
    Icon: VolumeDown,
    min: -70,
    max: -10,
    step: 1,
    format: (v) => `−${Math.abs(v)} dB`,
    hint: 'Audio below this RMS level is classified as silent.',
  },
  {
    key: 'minSilence',
    label: 'Min Silence Duration',
    Icon: Timer,
    min: 50,
    max: 2000,
    step: 50,
    format: (v) => `${v} ms`,
    hint: 'Pauses shorter than this duration are preserved for natural cadence.',
  },
  {
    key: 'padding',
    label: 'Speech Padding',
    Icon: SpaceBar,
    min: 0,
    max: 300,
    step: 10,
    format: (v) => `${v} ms`,
    hint: 'Buffer of audio kept around speech bounds to avoid word clipping.',
  },
];

export default function SettingsCard({ settings, onChange }) {
  return (
    <Box
      sx={{
        background: '#121620',
        border: '1px solid #1E2638',
        borderRadius: '12px',
        p: '20px 22px',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tune sx={{ fontSize: 16, color: '#00E5FF' }} />
          <Typography
            variant="caption"
            fontWeight={700}
            textTransform="uppercase"
            letterSpacing={0.8}
            sx={{ color: '#00E5FF', fontFamily: '"JetBrains Mono", monospace' }}
          >
            [PARAM_NODE] DETECTION_SETTINGS
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {SETTINGS_CONFIG.map(({ key, label, Icon, min, max, step, format, hint }) => (
          <Box key={key} sx={{ background: '#0E121B', border: '1px solid #1A2130', borderRadius: '8px', p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon sx={{ fontSize: 16, color: '#94A3B8' }} />
                <Typography variant="body2" fontWeight={700} color="#F1F5F9">
                  {label}
                </Typography>
              </Box>
              <Box
                sx={{
                  fontSize: '0.72rem',
                  fontFamily: '"JetBrains Mono", monospace',
                  fontWeight: 700,
                  px: 1.2,
                  py: 0.3,
                  borderRadius: '4px',
                  background: '#182030',
                  border: '1px solid #00E5FF',
                  color: '#00E5FF',
                }}
              >
                {format(settings[key])}
              </Box>
            </Box>

            <Slider
              value={settings[key]}
              min={min}
              max={max}
              step={step}
              onChange={(_, v) => onChange((prev) => ({ ...prev, [key]: v }))}
              sx={{ color: '#00E5FF', mb: 0.5 }}
            />

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.7rem' }}
            >
              {hint}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
