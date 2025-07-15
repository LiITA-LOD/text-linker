import type React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
} from '@mui/material';
import Wizard from './components/Wizard';

// Create a refined dark theme with better aesthetics
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1', // Indigo
      light: '#818cf8',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#8b5cf6', // Purple
      light: '#a78bfa',
      dark: '#7c3aed',
    },
    background: {
      default: '#0f172a', // Slate 900
      paper: 'rgba(30, 41, 59, 0.8)', // Slate 800 with transparency
    },
    text: {
      primary: '#f8fafc', // Slate 50
      secondary: '#cbd5e1', // Slate 300
    },
    divider: 'rgba(148, 163, 184, 0.1)', // Slate 400 with low opacity
  },
  typography: {
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.25rem',
      letterSpacing: '-0.025em',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.025em',
    },
    body1: {
      lineHeight: 1.6,
    },
    body2: {
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
          boxShadow: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid rgba(148, 163, 184, 0.1)',
        },
      },
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        <AppBar position="static" elevation={0}>
          <Toolbar sx={{ justifyContent: 'center', py: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h1" component="h1" sx={{ mb: 0.5 }}>
                LiITA TextLinker
              </Typography>
              <Typography
                variant="body1"
                sx={{ opacity: 0.8, fontWeight: 400 }}
              >
                Linguistic Data Annotation Wizard
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>

        <Container component="main" sx={{ flex: 1, py: 4, maxWidth: 'lg' }}>
          <Wizard />
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default App;
