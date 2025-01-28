import { createTheme } from '@mui/material';

const themePresets = {
  blue: {
    primary: '#00338D',
    secondary: '#00A0DC',
    background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)'
  },
  purple: {
    primary: '#6200EA',
    secondary: '#B388FF',
    background: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)'
  },
  green: {
    primary: '#2E7D32',
    secondary: '#81C784',
    background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)'
  },
  orange: {
    primary: '#E65100',
    secondary: '#FFB74D',
    background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)'
  },
  pink: {
    primary: '#C2185B',
    secondary: '#F48FB1',
    background: 'linear-gradient(135deg, #FCE4EC 0%, #F8BBD0 100%)'
  }
};

const backgroundPatterns = {
  circles: {
    light: `radial-gradient(circle at 100% 50%, rgba(0,0,0,0.03) 0%, transparent 50%),
            radial-gradient(circle at 0% 50%, rgba(0,0,0,0.03) 0%, transparent 50%)`,
    dark: `radial-gradient(circle at 100% 50%, rgba(255,255,255,0.03) 0%, transparent 50%),
           radial-gradient(circle at 0% 50%, rgba(255,255,255,0.03) 0%, transparent 50%)`
  },
  dots: {
    light: `radial-gradient(rgba(0,0,0,0.1) 2px, transparent 2px),
            radial-gradient(rgba(0,0,0,0.1) 2px, transparent 2px)`,
    dark: `radial-gradient(rgba(255,255,255,0.1) 2px, transparent 2px),
           radial-gradient(rgba(255,255,255,0.1) 2px, transparent 2px)`
  },
  waves: {
    light: `linear-gradient(45deg, rgba(0,0,0,0.03) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(0,0,0,0.03) 25%, transparent 25%)`,
    dark: `linear-gradient(45deg, rgba(255,255,255,0.03) 25%, transparent 25%),
           linear-gradient(-45deg, rgba(255,255,255,0.03) 25%, transparent 25%)`
  },
  grid: {
    light: `linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)`,
    dark: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
           linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`
  },
  none: {
    light: 'none',
    dark: 'none'
  }
};

const createCustomTheme = (mode, colors = themePresets.blue, pattern = 'none') => {
  const baseTheme = createTheme({
    palette: {
      mode,
      primary: {
        main: colors.primary,
        light: colors.secondary,
        dark: mode === 'light' 
          ? colors.primary + '99' // 60% opacity
          : colors.secondary + '99',
        contrastText: '#ffffff'
      },
      background: {
        default: mode === 'light' ? '#f8faff' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
        pattern: backgroundPatterns[pattern][mode],
        quiz: colors.background
      },
      text: {
        primary: mode === 'light' ? '#1a1a1a' : '#ffffff',
        secondary: mode === 'light' ? '#666666' : '#b3b3b3'
      },
      divider: mode === 'light' 
        ? `${colors.primary}1A` // 10% opacity
        : 'rgba(255,255,255,0.1)',
      gradient: {
        primary: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
        hover: `linear-gradient(90deg, ${colors.primary}99 0%, ${colors.secondary}99 100%)`,
        background: mode === 'light'
          ? 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)'
          : 'linear-gradient(135deg, #1e1e1e 0%, #121212 100%)'
      }
    }
  });

  return baseTheme;
};

const lightTheme = createCustomTheme('light');
const darkTheme = createCustomTheme('dark');

export { 
  lightTheme, 
  darkTheme, 
  createCustomTheme, 
  themePresets, 
  backgroundPatterns 
};
