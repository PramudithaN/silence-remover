import { createTheme } from '@mui/material/styles';

// ── 3-Color Tech Studio Node Theme ──────────────────────────
// Main: Electric Cyan (#00E5FF)
// Secondary: Studio Slate/Charcoal (#121620 box, #0B0D12 background)
// Optional Accent: Node Purple (#A855F7) / Emerald (#10B981)

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00E5FF',
      light: '#67F5FF',
      dark: '#00B3CC',
      contrastText: '#050B14',
    },
    secondary: {
      main: '#A855F7',
      light: '#C084FC',
      dark: '#7E22CE',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10B981',
      light: '#34D399',
      contrastText: '#042F2E',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
    },
    warning: {
      main: '#F59E0B',
    },
    background: {
      default: '#0B0D12',
      paper: '#121620',
    },
    divider: '#1E2638',
    text: {
      primary: '#F1F5F9',
      secondary: '#94A3B8',
      disabled: '#475569',
    },
  },
  typography: {
    fontFamily: '"Space Grotesk", "JetBrains Mono", sans-serif',
    h6: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.3px',
    },
    subtitle1: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 600,
    },
    subtitle2: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 600,
    },
    body1: {
      fontFamily: '"Space Grotesk", sans-serif',
    },
    body2: {
      fontFamily: '"Space Grotesk", sans-serif',
      lineHeight: 1.5,
    },
    caption: {
      fontFamily: '"JetBrains Mono", monospace',
      lineHeight: 1.4,
    },
    button: {
      fontFamily: '"Space Grotesk", sans-serif',
      fontWeight: 700,
      letterSpacing: '0.02em',
    },
  },
  shape: { borderRadius: 10 },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.5)',
    '0 2px 8px rgba(0,0,0,0.6)',
    '0 4px 16px rgba(0,0,0,0.7)',
    '0 8px 32px rgba(0,0,0,0.8)',
    ...Array(20).fill('none'),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: '#0B0D12',
          backgroundImage: 'radial-gradient(#1E2638 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          minHeight: '100vh',
          color: '#F1F5F9',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 700,
          borderRadius: 8,
          padding: '12px 20px',
          fontSize: '0.88rem',
          letterSpacing: '0.02em',
        },
        contained: {
          background: '#00E5FF',
          color: '#050B14',
          boxShadow: 'none',
          '&:hover': {
            background: '#67F5FF',
            boxShadow: '0 0 16px rgba(0,229,255,0.3)',
          },
        },
        outlined: {
          borderWidth: '1px',
          borderColor: '#1E2638',
          background: '#121620',
          '&:hover': {
            borderWidth: '1px',
            borderColor: '#00E5FF',
            background: 'rgba(0,229,255,0.06)',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 6,
          backgroundColor: '#1B2130',
        },
        bar: {
          background: '#00E5FF',
          borderRadius: 4,
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: { height: 4, color: '#00E5FF' },
        thumb: {
          width: 15,
          height: 15,
          background: '#00E5FF',
          boxShadow: 'none',
          '&:hover, &.Mui-focusVisible': { boxShadow: '0 0 0 5px rgba(0,229,255,0.2)' },
        },
        track: { borderRadius: 2, background: '#00E5FF', border: 'none' },
        rail: { borderRadius: 2, backgroundColor: '#1E2638' },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          background: '#121620',
          border: '1px solid #1E2638',
        },
      },
    },
  },
});
