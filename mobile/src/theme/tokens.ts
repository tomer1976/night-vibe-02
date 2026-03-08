export type ThemeColors = {
  backgroundPrimary: string;
  backgroundSecondary: string;
  surfaceCard: string;
  textPrimary: string;
  textSecondary: string;
  accentPrimary: string;
  accentSecondary: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
};

export type ThemeSpacing = {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  xxxl: number;
};

export type ThemeRadius = {
  sm: number;
  md: number;
  lg: number;
  xl: number;
};

export type ThemeTypography = {
  display: number;
  pageTitle: number;
  cardTitle: number;
  title: number;
  body: number;
  bodySmall: number;
  meta: number;
  label: number;
};

export type ThemeTokens = {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  radius: ThemeRadius;
  typography: ThemeTypography;
};

export const nightVibeDarkTheme: ThemeTokens = {
  colors: {
    backgroundPrimary: '#090B14',
    backgroundSecondary: '#11162A',
    surfaceCard: '#1A2034',
    textPrimary: '#F5F7FF',
    textSecondary: '#9AA6C2',
    accentPrimary: '#7A5CFF',
    accentSecondary: '#E64EC8',
    success: '#17C6A3',
    warning: '#F2A93B',
    danger: '#E4516D',
    info: '#3BA9F2',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  radius: {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
  },
  typography: {
    display: 32,
    pageTitle: 24,
    cardTitle: 20,
    title: 20,
    body: 16,
    bodySmall: 14,
    meta: 12,
    label: 12,
  },
};