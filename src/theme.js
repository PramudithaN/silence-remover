import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary:    { main: '#7C6FF7' },
    success:    { main: '#34D399' },
    error:      { main: '#F87171' },
    background: { default: '#0C0C11', paper: '#13131A' },
    divider:    'rgba(255,255,255,0.06)',
    text: {
      primary:  '#EDEDF4',
      secondary: '#8E8EA8',
      disabled:  '#4E4E68',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(255,255,255,0.06)',
          backgroundColor: '#13131A',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 12,
          padding: '14px 20px',
          fontSize: '0.9rem',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 4, height: 4 },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root:  { height: 3 },
        thumb: { width: 18, height: 18 },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
  },
});
