import { createTheme } from '@mui/material';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#00338D',
      light: '#00A0DC',
      dark: '#002266',
      contrastText: '#ffffff'
    },
    background: {
      default: '#f8faff',
      paper: '#ffffff'
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#666666'
    },
    divider: 'rgba(0,51,141,0.1)',
    gradient: {
      primary: 'linear-gradient(90deg, #00338D 0%, #00A0DC 100%)',
      hover: 'linear-gradient(90deg, #002266 0%, #007AA6 100%)',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)'
    }
  }
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00A0DC',
      light: '#4dd3ff',
      dark: '#0077a3',
      contrastText: '#ffffff'
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e'
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3'
    },
    divider: 'rgba(255,255,255,0.1)',
    gradient: {
      primary: 'linear-gradient(90deg, #00A0DC 0%, #4dd3ff 100%)',
      hover: 'linear-gradient(90deg, #0077a3 0%, #00a0dc 100%)',
      background: 'linear-gradient(135deg, #1e1e1e 0%, #121212 100%)'
    }
  }
});

export { lightTheme, darkTheme };
