import { Colors, Spacing, Typography, Radius, Shadows } from './index';

export const authTheme = {
  colors: {
    ...Colors,

    background: '#050505',
    surface: '#0E0E10',
    surfaceElevated: '#16181B',

    glass: 'rgba(255,255,255,0.04)',
    glassBorder: 'rgba(255,255,255,0.08)',

    border: '#1F2623',

    accent: '#00E5A8',
    accentMuted: 'rgba(0,229,168,0.12)',

    textPrimary: '#FFFFFF',
    textSecondary: '#A0A0A0',

    placeholder: '#5C6360',

    error: '#FF5252',
    errorMuted: 'rgba(255,82,82,0.12)',
  },

  spacing: Spacing,
  typography: Typography,
  radius: Radius,
  shadows: Shadows,
};

export default authTheme;