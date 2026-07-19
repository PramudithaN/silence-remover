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
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 2,
        p: '20px 22px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      {/* Card Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <UploadFile sx={{ fontSize: 15, color: 'text.disabled' }} />
        <Typography
          variant="caption"
          fontWeight={600}
          textTransform="uppercase"
          letterSpacing={0.7}
          color="text.disabled"
        >
          Select Video Files
        </Typography>
      </Box>

      {/* Drop Zone */}
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
          borderColor: dragging ? 'primary.main' : 'rgba(255,255,255,0.09)',
          borderRadius: 2,
          p: '44px 24px 40px',
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: dragging ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.02)',
          transition: 'all 0.2s',
          boxShadow: dragging ? '0 0 0 4px rgba(255,255,255,0.12)' : 'none',
          '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(255,255,255,0.04)' },
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
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.16)',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            color: 'primary.main',
            mx: 'auto',
            mb: 2,
          }}
        >
          <Movie sx={{ fontSize: 28 }} />
        </Box>

        <Typography fontWeight={600} mb={0.5}>
          Drop video files here
        </Typography>
        <Typography variant="body2" color="text.secondary">
          or{' '}
          <Box component="span" color="primary.main" fontWeight={600}>
            click to browse
          </Box>
          {' '} single clip or batch upload supported
        </Typography>

        {/* Formats */}
        <Box
          sx={{
            display: 'flex',
            gap: 0.75,
            flexWrap: 'wrap',
            justify: 'center',
            mt: 2,
          }}
        >
          {VIDEO_FORMATS.map((f) => (
            <Box
              key={f}
              sx={{
                fontSize: '0.67rem',
                fontWeight: 700,
                px: 1.2,
                py: 0.5,
                borderRadius: '6px',
                bgcolor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.10)',
                color: 'text.secondary',
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
