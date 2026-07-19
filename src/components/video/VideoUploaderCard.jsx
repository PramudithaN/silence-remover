import React, { useCallback, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { UploadFile, Movie } from '@mui/icons-material';

const VIDEO_FORMATS = ['MP4', 'MOV', 'WEBM', 'MKV', 'AVI'];

export default function VideoUploaderCard({ onFilesSelected }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith('video/') || /\.(mp4|mov|webm|mkv|avi)$/i.test(f.name)
      );
      if (files.length) onFilesSelected(files);
    },
    [onFilesSelected]
  );

  return (
    <Box
      sx={{
        background: '#1E1E24',
        border: '1px solid #2F2F38',
        borderRadius: '12px',
        p: '20px 22px',
        position: 'relative',
      }}
    >
      {/* Node Tag Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <UploadFile sx={{ fontSize: 16, color: '#A855F7' }} />
          <Typography
            variant="caption"
            fontWeight={700}
            textTransform="uppercase"
            letterSpacing={0.8}
            sx={{ color: '#A855F7', fontFamily: '"JetBrains Mono", monospace' }}
          >
            [INPUT_NODE] VIDEO_CLIPS
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.65rem' }}>
          BATCH_VIDEO_INGEST
        </Typography>
      </Box>

      {/* Drop Zone Box */}
      <Box
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        sx={{
          position: 'relative',
          border: '1.5px dashed',
          borderColor: dragging ? '#A855F7' : '#2F2F38',
          borderRadius: '8px',
          p: '40px 24px 36px',
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: dragging ? 'rgba(168,85,247,0.06)' : '#18181D',
          transition: 'all 0.15s ease',
          '&:hover': { borderColor: '#A855F7', bgcolor: 'rgba(168,85,247,0.03)' },
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => {
            const files = Array.from(e.target.files || []).filter(
              (f) => f.type.startsWith('video/') || /\.(mp4|mov|webm|mkv|avi)$/i.test(f.name)
            );
            if (files.length) onFilesSelected(files);
          }}
        />

        {/* Icon */}
        <Box
          sx={{
            width: 50,
            height: 50,
            borderRadius: '8px',
            background: '#1D172A',
            border: '1px solid #2D1F42',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#A855F7',
            mx: 'auto',
            mb: 2,
          }}
        >
          <Movie sx={{ fontSize: 24, display: 'block' }} />
        </Box>

        <Typography fontWeight={700} mb={0.5} color="#F1F5F9">
          Drop video clips to ingest
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.78rem' }}>
          or{' '}
          <Box component="span" color="#A855F7" fontWeight={700}>
            click to browse
          </Box>
          {' '}— single clip or batch video processing
        </Typography>

        {/* Formats */}
        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', justifyContent: 'center', mt: 2 }}>
          {VIDEO_FORMATS.map((f) => (
            <Box
              key={f}
              sx={{
                fontSize: '0.65rem',
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: 700,
                px: 1.2,
                py: 0.4,
                borderRadius: '4px',
                bgcolor: '#141A26',
                border: '1px solid #1E2638',
                color: '#94A3B8',
              }}
            >
              {f}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
