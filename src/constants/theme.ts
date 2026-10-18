export interface ColorPalette {
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceSecondary: string;
  card: string;
  cardBorder: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accentSky: string;
  accentMint: string;
  accentLavender: string;
  accentCream: string;
  progressTrack: string;
  progressFill: string;
  progressGlow: string;
  danger: string;
  warning: string;
  success: string;
  navBackground: string;
  navActive: string;
  navInactive: string;
  shadow: string;
}

export const lightPalette: ColorPalette = {
  background: '#F0F9FF',
  backgroundSecondary: '#E0F2FE',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8FAFC',
  card: '#FFFFFF',
  cardBorder: '#E2E8F0',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  primary: '#00D2EE',
  primaryLight: '#7DD3FC',
  primaryDark: '#0284C7',
  accentSky: '#38BDF8',
  accentMint: '#34D399',
  accentLavender: '#C084FC',
  accentCream: '#FDE68A',
  progressTrack: '#E0F2FE',
  progressFill: '#00D2EE',
  progressGlow: 'rgba(0, 210, 238, 0.25)',
  danger: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
  navBackground: '#FFFFFF',
  navActive: '#0284C7',
  navInactive: '#94A3B8',
  shadow: 'rgba(15, 23, 42, 0.06)',
};

export const darkPalette: ColorPalette = {
  background: '#090E17',
  backgroundSecondary: '#0F172A',
  surface: '#131D2E',
  surfaceSecondary: '#1E293B',
  card: '#131D2E',
  cardBorder: '#1E293B',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  primary: '#00E5FF',
  primaryLight: '#38BDF8',
  primaryDark: '#0284C7',
  accentSky: '#38BDF8',
  accentMint: '#10B981',
  accentLavender: '#8B5CF6',
  accentCream: '#F59E0B',
  progressTrack: '#1E293B',
  progressFill: '#00E5FF',
  progressGlow: 'rgba(0, 229, 255, 0.35)',
  danger: '#F87171',
  warning: '#FBBF24',
  success: '#34D399',
  navBackground: '#0F172A',
  navActive: '#00E5FF',
  navInactive: '#64748B',
  shadow: 'rgba(0, 0, 0, 0.4)',
};

export const theme = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    full: 9999,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    hero: 38,
  },
};
