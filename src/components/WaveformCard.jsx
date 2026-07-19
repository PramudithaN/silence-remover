import React, { useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { GraphicEq } from '@mui/icons-material';

export default function WaveformCard({ waveformData }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !waveformData) return;

    const { samples, padded } = waveformData;
    const W = canvas.offsetWidth || 700;
    const H = 72;
    canvas.width = W * devicePixelRatio;
    canvas.height = H * devicePixelRatio;
    const ctx = canvas.getContext('2d');
    ctx.scale(devicePixelRatio, devicePixelRatio);
    ctx.clearRect(0, 0, W, H);

    const step = Math.ceil(samples.length / W);
    const mid = H / 2;

    for (let x = 0; x < W; x++) {
      let max = 0;
      const base = x * step;
      for (let j = 0; j < step; j++) {
        const v = Math.abs(samples[base + j] || 0);
        if (v > max) max = v;
      }
      if (padded) {
        const fi = Math.floor((base / samples.length) * padded.length);
        ctx.strokeStyle = padded[fi] ? '#00E5FF' : '#1E2638';
      } else {
        ctx.strokeStyle = '#00E5FF';
      }
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, mid - max * mid);
      ctx.lineTo(x, mid + max * mid);
      ctx.stroke();
    }
  }, [waveformData]);

  return (
    <Box
      sx={{
        background: '#121620',
        border: '1px solid #1E2638',
        borderRadius: '12px',
        p: '20px 22px',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GraphicEq sx={{ fontSize: 16, color: '#00E5FF' }} />
          <Typography
            variant="caption"
            fontWeight={700}
            textTransform="uppercase"
            letterSpacing={0.8}
            sx={{ color: '#00E5FF', fontFamily: '"JetBrains Mono", monospace' }}
          >
            [WAVEFORM_NODE] AUDIO_SIGNAL
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: '#94A3B8', fontFamily: '"JetBrains Mono", monospace', fontSize: '0.7rem' }}>
          Cyan = Kept Speech · Dark = Removed Silence
        </Typography>
      </Box>

      <Box sx={{ borderRadius: '6px', overflow: 'hidden', bgcolor: '#090B0E', border: '1px solid #1A2130' }}>
        <canvas
          ref={canvasRef}
          height={72}
          style={{ width: '100%', display: 'block' }}
        />
      </Box>
    </Box>
  );
}
