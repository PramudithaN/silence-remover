import React, { useCallback, useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { UploadFile, AudioFile } from '@mui/icons-material';

const FORMATS = ['MP3', 'WAV', 'M4A', 'OGG', 'FLAC', 'AIFF'];

export default function DropZoneCard({ onFilesSelected, files }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) onFilesSelected(e.dataTransfer.files);
  }, [onFilesSelected]);

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
          <UploadFile sx={{ fontSize: 16, color: '#00E5FF' }} />
          <Typography
            variant="caption"
            fontWeight={700}
            textTransform="uppercase"
            letterSpacing={0.8}
            sx={{ color: '#00E5FF', fontFamily: '"JetBrains Mono", monospace' }}
          >
            [INPUT_NODE] AUDIO_FILES
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.65rem' }}>
          MULTI_INPUT_ENABLED
        </Typography>
      </Box>

      {/* Drop Zone Box */}
      <Box
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        sx={{
          position: 'relative',
          border: '1.5px dashed',
          borderColor: dragging ? '#00E5FF' : '#2F2F38',
          borderRadius: '8px',
          p: '40px 24px 36px',
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: dragging ? 'rgba(0,229,255,0.06)' : '#18181D',
          transition: 'all 0.15s ease',
          '&:hover': { borderColor: '#00E5FF', bgcolor: 'rgba(0,229,255,0.03)' },
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => { if (e.target.files.length) onFilesSelected(e.target.files); }}
        />

        {/* Icon */}
        <Box
          sx={{
            width: 50,
            height: 50,
            borderRadius: '8px',
            background: '#262630',
            border: '1px solid #2F2F38',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#00E5FF',
            mx: 'auto',
            mb: 2,
          }}
        >
          <AudioFile sx={{ fontSize: 24, display: 'block' }} />
        </Box>

        <Typography fontWeight={700} mb={0.5} color="#F1F5F9">
          Drop audio files to ingest
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"JetBrains Mono", monospace', fontSize: '0.78rem' }}>
          or{' '}
          <Box component="span" color="#00E5FF" fontWeight={700}>
            click to browse
          </Box>
          {' '}— single or batch audio
        </Typography>

        {/* Format Tags */}
        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', justifyContent: 'center', mt: 2 }}>
          {FORMATS.map((f) => (
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

        {files.length > 0 && (
          <Typography
            variant="caption"
            sx={{
              color: '#00E5FF',
              fontWeight: 700,
              display: 'block',
              mt: 2,
              fontFamily: '"JetBrains Mono", monospace',
            }}
          >
            ✓ {files.length === 1 ? files[0].name : `${files.length} FILES LOADED`}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
