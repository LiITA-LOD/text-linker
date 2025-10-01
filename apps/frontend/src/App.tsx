import {
  AppBar,
  Box,
  Container,
  CssBaseline,
  Toolbar,
  Typography,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { darkTheme, lightTheme } from "./themes";
import type React from 'react';
import { useState } from 'react';
import Wizard from './components/Wizard';
import ThemeSwitcher from './components/ThemeSwitcher';
import NavigationLinks from './components/NavigationLinks';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const navigationLinks = [
    { url: 'https://liita.it', label: 'Back to Home' },
  ];

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Box
        sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        <AppBar position="static" elevation={0}>
          <Toolbar sx={{ justifyContent: 'center', py: 2 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h1" component="h1" sx={{ mb: 0.5 }}>
                LiITA Text Linker
              </Typography>
              <NavigationLinks links={navigationLinks} />
            </Box>
            <ThemeSwitcher mode={isDarkMode ? 'dark' : 'light'} onToggleTheme={toggleTheme} />
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
