import React from 'react';
import { Box, Typography, Slider } from '@mui/material';
import { Tune, VolumeDown, Timer, SpaceBar } from '@mui/icons-material';

const SETTINGS_CONFIG = [
  {
    key: 'threshold',
    label: 'Silence Threshold',
    Icon: VolumeDown,
    min: -70, max: -10, step: 1,
    format: v => `\u2212${Math.abs(v)} dB`,
    hint: 'Audio below this level is treated as silence. Raise for noisy rooms, lower for studio recordings.',
  },
  {
    key: 'minSilence',
    label: 'Min Silence Duration',
    Icon: Timer,
    min: 50, max: 2000, step: 50,
    format: v => `${v} ms`,
    hint: 'Gaps shorter than this are preserved to avoid choppy output on rapid speech.',
  },
  {
    key: 'padding',
    label: 'Speech Padding',
    Icon: SpaceBar,
    min: 0, max: 300, step: 10,
    format: v => `${v} ms`,
    hint: 'Buffer of audio kept around each speech segment so words are never clipped.',
  },
];

export default function SettingsCard({ settings, onChange }) {
  return (
    <Box sx={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2, p: '20px 22px', boxShadow: '0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
        <Tune sx={{ fontSize: 15, color: 'text.disabled' }} />
        <Typography variant="caption" fontWeight={600} textTransform="uppercase" letterSpacing={0.7} color="text.disabled">
          Processing Settings
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {SETTINGS_CONFIG.map(({ key, label, Icon, min, max, step, format, hint }) => (
          <Box key={key}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon sx={{ fontSize: 18, color: 'text.disabled' }} />
                <Typography variant="body2" fontWeight={500}>{label}</Typography>
              </Box>
              <Box sx={{
                fontSize: '0.75rem', fontWeight: 700,
                px: 1.25, py: 0.35, borderRadius: '20px',
                background: 'rgba(255,255,255,0.08)', color: 'primary.main',
              }}>
                {format(settings[key])}
              </Box>
            </Box>

            <Slider
              value={settings[key]}
              min={min} max={max} step={step}
              onChange={(_, v) => onChange(prev => ({ ...prev, [key]: v }))}
              sx={{ color: 'primary.main', mb: 0.5 }}
            />

            <Typography variant="caption" color="text.disabled" sx={{ lineHeight: 1.5 }}>
              {hint}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
