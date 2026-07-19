import React, { useState } from 'react';
import {
  Box, Container, Typography, Button, Paper, Chip,
} from '@mui/material';
import { GraphicEq, Movie, Lock } from '@mui/icons-material';
import AudioSilenceRemover from './components/audio/AudioSilenceRemover';
import VideoSilenceRemover from './components/video/VideoSilenceRemover';

export default function App() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box
      sx={{
        background: '#141414',
        backgroundImage: 'radial-gradient(#272E3F 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        minHeight: '100vh',
        pb: 8,
        position: 'relative',
      }}
    >
      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 }, pt: 4 }}>
        {/* Tech Node Boxed Header */}
        <Box
          sx={{
            background: '#1E1E24',
            border: '1px solid #2F2F38',
            borderRadius: '12px',
            p: '20px 24px',
            mb: 3,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
            position: 'relative',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '8px',
                background: '#262630',
                border: '1px solid #00E5FF',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00E5FF',
                flexShrink: 0,
              }}
            >
              {activeTab === 0 ? (
                <GraphicEq sx={{ fontSize: 24, display: 'block' }} />
              ) : (
                <Movie sx={{ fontSize: 24, display: 'block' }} />
              )}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Typography
                variant="h6"
                fontWeight={700}
                letterSpacing="-0.3px"
                sx={{ lineHeight: 1.2, mb: 0.2, color: '#F1F5F9' }}
              >
                Silence Remover Studio
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ lineHeight: 1.2, display: 'block', fontFamily: '"JetBrains Mono", monospace' }}
              >
                {activeTab === 0
                  ? '[ENGINE: WEB_AUDIO_API] Strip silence from audio in bulk'
                  : '[ENGINE: FFMPEG_WASM] Detect & cut silent video frames'}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '6px',
              px: 1.5,
              py: 0.8,
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: '#10B981',
                flexShrink: 0,
              }}
            />
            <Lock sx={{ fontSize: 13, color: '#10B981', display: 'block' }} />
            <Typography
              variant="caption"
              sx={{ color: '#10B981', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.02em', lineHeight: 1 }}
            >
              100% LOCAL BROWSER PROCESSING
            </Typography>
          </Box>
        </Box>

        {/* 2-Tab Navigation Segmented Node Control */}
        <Paper
          elevation={0}
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 1,
            background: '#1E1E24',
            border: '1px solid #2F2F38',
            borderRadius: '10px',
            p: '5px',
            mb: 3,
          }}
        >
          <Button
            onClick={() => setActiveTab(0)}
            sx={{
              py: 1.2,
              px: 2,
              borderRadius: '6px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              color: activeTab === 0 ? '#00E5FF' : 'text.secondary',
              background: activeTab === 0 ? '#262630' : 'transparent',
              border: activeTab === 0 ? '1px solid #00E5FF' : '1px solid transparent',
              transition: 'all 0.15s ease',
              '&:hover': {
                background: activeTab === 0 ? '#262630' : 'rgba(255, 255, 255, 0.03)',
              },
            }}
          >
            <GraphicEq sx={{ fontSize: 18, display: 'block' }} />
            AUDIO NODE
          </Button>

          <Button
            onClick={() => setActiveTab(1)}
            sx={{
              py: 1.2,
              px: 2,
              borderRadius: '6px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              color: activeTab === 1 ? '#A855F7' : 'text.secondary',
              background: activeTab === 1 ? '#2E2638' : 'transparent',
              border: activeTab === 1 ? '1px solid #A855F7' : '1px solid transparent',
              transition: 'all 0.15s ease',
              '&:hover': {
                background: activeTab === 1 ? '#2E2638' : 'rgba(255, 255, 255, 0.03)',
              },
            }}
          >
            <Movie sx={{ fontSize: 18, display: 'block' }} />
            VIDEO NODE
          </Button>
        </Paper>

        {/* Tab Content */}
        {activeTab === 0 && <AudioSilenceRemover />}
        {activeTab === 1 && <VideoSilenceRemover />}
      </Container>
    </Box>
  );
}
