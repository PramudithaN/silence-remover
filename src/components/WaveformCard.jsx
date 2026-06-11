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
    canvas.width  = W * devicePixelRatio;
    canvas.height = H * devicePixelRatio;
    const ctx = canvas.getContext('2d');
    ctx.scale(devicePixelRatio, devicePixelRatio);
    ctx.clearRect(0, 0, W, H);

    const step = Math.ceil(samples.length / W);
    const mid  = H / 2;

    for (let x = 0; x < W; x++) {
      let max = 0;
      const base = x * step;
      for (let j = 0; j < step; j++) {
        const v = Math.abs(samples[base + j] || 0);
        if (v > max) max = v;
      }
      if (padded) {
        const fi = Math.floor((base / samples.length) * padded.length);
        ctx.strokeStyle = padded[fi] ? '#E2E8F0' : 'rgba(255,255,255,0.05)';
      } else {
        ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      }
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, mid - max * mid);
      ctx.lineTo(x, mid + max * mid);
      ctx.stroke();
    }
  }, [waveformData]);

  return (
    <Box sx={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2, p: '20px 22px', boxShadow: '0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <GraphicEq sx={{ fontSize: 15, color: 'text.disabled' }} />
        <Typography variant="caption" fontWeight={600} textTransform="uppercase" letterSpacing={0.7} color="text.disabled">
          Waveform
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ ml: 'auto' }}>
          <Box component="span" color="primary.light">Purple</Box>
          {' '}= speech kept · dark = silence removed
        </Typography>
      </Box>

        <Box sx={{ borderRadius: 1, overflow: 'hidden', bgcolor: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <canvas
          ref={canvasRef}
          height={72}
          style={{ width: '100%', display: 'block' }}
        />
      </Box>
    </Box>
  );
}
