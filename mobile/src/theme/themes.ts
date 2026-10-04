export type ThemeName = 'futuristic' | 'darkTech';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  primary: string;
  primaryDark: string;
  primarySoft: string;
  accent: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  sos: string;
  overlay: string;
}

export interface ThemeTokens {
  name: string;
  description: string;
  mode: 'light' | 'dark';
  colors: ThemeColors;
  spacing: any;
  radius: any;
  typography: any;
  shadows: any;
  graphics: any;
}

const baseSpacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 40, xxxl: 64 };
const baseTypography = {
  fontFamily: 'System',
  h1: 32, h2: 24, h3: 18, body: 16, caption: 12,
  fontWeights: { normal: '400', medium: '500', semibold: '600', bold: '700', heavy: '900' as const },
  fontSizes: { xs: 12, sm: 14, md: 16, lg: 20, xl: 24, xxl: 32 }
};

export const themes: Record<ThemeName, ThemeTokens> = {
  futuristic: {
    name: 'Futuristic Civic',
    description: 'Modern civic technology',
    mode: 'dark',
    colors: { background: '#050505', surface: '#0a0a0a', surfaceElevated: '#111111', text: '#FFFFFF', textSecondary: '#A0A0A0', textTertiary: '#666666', primary: '#00F0FF', primaryDark: '#00B8D9', primarySoft: 'rgba(0, 240, 255, 0.1)', accent: '#00F0FF', border: 'rgba(0, 240, 255, 0.2)', success: '#00F0FF', warning: '#FFFFFF', error: '#FFFFFF', sos: '#FFFFFF', overlay: 'rgba(5, 5, 5, 0.8)' },
    spacing: baseSpacing,
    radius: { sm: 4, md: 8, lg: 12, xl: 16, round: 999 },
    typography: baseTypography,
    shadows: { sm: { elevation: 2, shadowColor: '#00F0FF', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }, md: { elevation: 4, shadowColor: '#00F0FF', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }, lg: { elevation: 8, shadowColor: '#00F0FF', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } }, glow: { elevation: 12, shadowColor: '#00F0FF', shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 0 } } },
    graphics: { useGradients: false, useMapPatterns: true, useGlow: true, organicShapes: false }
  },
  darkTech: {
    name: 'Dark Civic Tech',
    description: 'High-contrast tech aesthetic',
    mode: 'dark',
    colors: { background: '#000000', surface: '#050505', surfaceElevated: '#0a0a0a', text: '#FFFFFF', textSecondary: '#888888', textTertiary: '#444444', primary: '#00F0FF', primaryDark: '#00B8D9', primarySoft: 'rgba(0, 240, 255, 0.1)', accent: '#00F0FF', border: '#222222', success: '#00F0FF', warning: '#FFFFFF', error: '#FFFFFF', sos: '#FFFFFF', overlay: 'rgba(0,0,0,0.9)' },
    spacing: { xs: 2, sm: 6, md: 12, lg: 20, xl: 28, xxl: 36, xxxl: 50 },
    radius: { sm: 2, md: 4, lg: 6, xl: 8, round: 999 },
    typography: baseTypography,
    shadows: { sm: { elevation: 2, shadowColor: '#00F0FF', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } }, md: { elevation: 4, shadowColor: '#00F0FF', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }, lg: { elevation: 8, shadowColor: '#00F0FF', shadowOpacity: 0.3, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } }, glow: { elevation: 12, shadowColor: '#00F0FF', shadowOpacity: 0.2, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } } },
    graphics: { useGradients: false, useMapPatterns: false, useGlow: true, organicShapes: false }
  },
};
