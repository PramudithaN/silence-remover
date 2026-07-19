import React, { useState } from 'react';
import {
  Box, Container, Typography, Button, Paper,
} from '@mui/material';
import { GraphicEq, Movie, Lock } from '@mui/icons-material';
import AudioSilenceRemover from './components/audio/AudioSilenceRemover';
import VideoSilenceRemover from './components/video/VideoSilenceRemover';

export default function App() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Box
      sx={{
        background: 'linear-gradient(160deg, #0A0A0A 0%, #111118 55%, #0A0A0A 100%)',
        minHeight: '100vh',
        pb: 8,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient color Orbs */}
      <Box
        sx={{
          position: 'fixed',
          top: '-15%',
          left: '-8%',
          width: 620,
          height: 620,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 65%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'fixed',
          bottom: '-18%',
          right: '-8%',
          width: 660,
          height: 660,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(226,232,240,0.05) 0%, transparent 65%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'fixed',
          top: '38%',
          right: '14%',
          width: 360,
          height: 360,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(241,245,249,0.04) 0%, transparent 65%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 }, position: 'relative', zIndex: 1 }}>
        {/* Main Header */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            py: 4,
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.18)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'primary.main',
                boxShadow: '0 2px 12px rgba(255,255,255,0.06)',
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
                letterSpacing="-0.4px"
                sx={{ lineHeight: 1.2, mb: 0.2 }}
              >
                Silence Remover
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ lineHeight: 1.2, display: 'block' }}
              >
                {activeTab === 0
                  ? 'Strip silence from audio files in bulk'
                  : 'Detect and trim silent parts in video clips'}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              background: 'linear-gradient(135deg, rgba(52,211,153,0.18) 0%, rgba(16,185,129,0.10) 100%)',
              border: '1px solid rgba(52,211,153,0.40)',
              backdropFilter: 'blur(12px)',
              borderRadius: '20px',
              px: 2,
              py: 1,
              boxShadow: '0 0 16px rgba(52,211,153,0.20), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: '#34D399',
                boxShadow: '0 0 6px #34D399',
                flexShrink: 0,
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } },
              }}
            />
            <Lock sx={{ fontSize: 13, color: '#34D399', display: 'block' }} />
            <Typography
              variant="caption"
              sx={{ color: '#34D399', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.02em', lineHeight: 1 }}
            >
              Runs 100% in your browser
            </Typography>
          </Box>
        </Box>

        {/* 2-Tab Navigation Segmented Control */}
        <Paper
          elevation={0}
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 1,
            background: 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px',
            p: '5px',
            mb: 3.5,
          }}
        >
          <Button
            onClick={() => setActiveTab(0)}
            sx={{
              py: 1.2,
              px: 2,
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.2,
              color: activeTab === 0 ? '#ffffff' : 'text.secondary',
              background: activeTab === 0 ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              border: activeTab === 0 ? '1px solid rgba(255, 255, 255, 0.18)' : '1px solid transparent',
              boxShadow: activeTab === 0 ? '0 4px 16px rgba(0,0,0,0.2)' : 'none',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: activeTab === 0 ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            <GraphicEq sx={{ fontSize: 20, display: 'block' }} />
            Audio Silence Remover
          </Button>

          <Button
            onClick={() => setActiveTab(1)}
            sx={{
              py: 1.2,
              px: 2,
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.2,
              color: activeTab === 1 ? '#ffffff' : 'text.secondary',
              background: activeTab === 1 ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
              border: activeTab === 1 ? '1px solid rgba(255, 255, 255, 0.18)' : '1px solid transparent',
              boxShadow: activeTab === 1 ? '0 4px 16px rgba(0,0,0,0.2)' : 'none',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: activeTab === 1 ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            <Movie sx={{ fontSize: 20, display: 'block' }} />
            Video Silence Remover
          </Button>
        </Paper>

        {/* Tab Content */}
        {activeTab === 0 && <AudioSilenceRemover />}
        {activeTab === 1 && <VideoSilenceRemover />}
      </Container>
    </Box>
  );
}
