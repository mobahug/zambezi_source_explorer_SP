import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#020617',
      paper: 'rgba(6, 9, 20, 0.9)',
    },
    primary: {
      main: '#14b8a6',
    },
    secondary: {
      main: '#f97316',
    },
    text: {
      primary: '#e5e7eb',
      secondary: '#cbd5e1',
    },
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, rgba(12, 17, 35, 0.95), rgba(9, 12, 26, 0.9))',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
    },
  },
});

export default theme;
