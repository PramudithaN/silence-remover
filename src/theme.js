import { createTheme } from '@mui/material/styles';

// ── Glass / ambient gradient dark theme ──────────────────────────
export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary:    { main: '#E2E8F0', light: '#F8FAFC', dark: '#94A3B8', contrastText: '#0A0A0A' },
    success:    { main: '#86EFAC', light: '#BBF7D0', contrastText: '#052E16' },
    error:      { main: '#FCA5A5', light: '#FECACA' },
    warning:    { main: '#FDE68A' },
    background: { default: '#0A0A0A', paper: 'rgba(255,255,255,0.04)' },
    divider:    'rgba(255,255,255,0.07)',
    text: {
      primary:   '#F1F5F9',
      secondary: '#94A3B8',
      disabled:  '#475569',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h6:      { fontWeight: 700, letterSpacing: '-0.5px' },
    body2:   { lineHeight: 1.6 },
    caption: { lineHeight: 1.5 },
  },
  shape: { borderRadius: 14 },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.3)',
    '0 2px 8px rgba(0,0,0,0.35)',
    '0 4px 16px rgba(0,0,0,0.4)',
    '0 8px 32px rgba(0,0,0,0.45)',
    ...Array(20).fill('none'),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(160deg, #0A0A0A 0%, #111118 50%, #0A0A0A 100%)',
          minHeight: '100vh',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 12,
          padding: '13px 22px',
          fontSize: '0.9rem',
          letterSpacing: '0.01em',
        },
        contained: {
          background: 'linear-gradient(135deg, #64748B 0%, #E2E8F0 100%)',
          boxShadow: '0 4px 20px rgba(255,255,255,0.12)',
          '&:hover': {
            background: 'linear-gradient(135deg, #475569 0%, #CBD5E1 100%)',
            boxShadow: '0 6px 28px rgba(255,255,255,0.20)',
          },
        },
        outlined: {
          borderWidth: '1px',
          backdropFilter: 'blur(12px)',
          '&:hover': { borderWidth: '1px' },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 6, height: 5,
          backgroundColor: 'rgba(255,255,255,0.08)',
        },
        bar: {
          background: 'linear-gradient(90deg, #94A3B8, #E2E8F0)',
          borderRadius: 6,
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root:  { height: 3, color: '#E2E8F0' },
        thumb: {
          width: 17, height: 17,
          background: 'linear-gradient(135deg, #94A3B8, #F1F5F9)',
          boxShadow: '0 0 0 3px rgba(255,255,255,0.15)',
          '&:hover, &.Mui-focusVisible': { boxShadow: '0 0 0 6px rgba(255,255,255,0.22)' },
        },
        track: { borderRadius: 3, background: 'linear-gradient(90deg, #94A3B8, #E2E8F0)', border: 'none' },
        rail:  { borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.10)' },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backdropFilter: 'blur(16px)',
        },
      },
    },
  },
});
