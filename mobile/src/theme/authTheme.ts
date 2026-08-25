import { Colors, Spacing, Typography, Radius, Shadows } from './index';

export const authTheme = {
  colors: {
    ...Colors,

    background: Colors.background,
    surface: Colors.surface,
    surfaceElevated: Colors.surface,

    glass: Colors.surface,
    glassBorder: Colors.border,

    border: Colors.border,

    accent: Colors.primary,
    accentMuted: Colors.primaryLight,

    textPrimary: Colors.textPrimary,
    textSecondary: Colors.textSecondary,

    placeholder: Colors.placeholder,

    error: Colors.error,
    errorMuted: '#FBEAEA',
  },

  spacing: Spacing,
  typography: Typography,
  radius: Radius,
  shadows: Shadows,
};

export default authTheme;