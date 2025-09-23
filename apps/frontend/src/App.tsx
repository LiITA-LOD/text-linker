import {
  AppBar,
  Box,
  Container,
  CssBaseline,
  Toolbar,
  Typography,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { darkTheme } from "./themes";
import type React from 'react';
import Wizard from './components/Wizard';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={darkTheme}>
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
