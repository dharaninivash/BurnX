import { useStore } from '../store/useStore';

const baseColors = {
  primary: '#FF5722', // Deep vibrant orange
  primaryLight: '#FF8A50',
  primaryDark: '#E64A19',
  error: '#FF3B30',
  success: '#34C759',
  warning: '#FFCC00',
  info: '#007AFF', // iOS blue
};

const darkColors = {
  ...baseColors,
  background: '#000000',
  surface: '#1C1C1E', // iOS Dark Modal
  surfaceSecondary: '#2C2C2E',
  textPrimary: '#FFFFFF',
  textSecondary: '#EBEBF599', // iOS secondary label
  textTertiary: '#EBEBF54D',
  border: '#38383A',
  divider: '#38383A',
};

const lightColors = {
  ...baseColors,
  background: '#F2F2F7', // iOS grouped background
  surface: '#FFFFFF',
  surfaceSecondary: '#F2F2F7',
  textPrimary: '#000000',
  textSecondary: '#3C3C4399',
  textTertiary: '#3C3C434D',
  border: '#C6C6C8',
  divider: '#C6C6C8',
};

const getTypography = (colors) => ({
  largeTitle: { fontSize: 34, fontWeight: '800', color: colors.textPrimary, letterSpacing: 0.41, lineHeight: 41 },
  header: { fontSize: 28, fontWeight: '700', color: colors.textPrimary, letterSpacing: 0.36, lineHeight: 34 },
  title: { fontSize: 22, fontWeight: '600', color: colors.textPrimary, letterSpacing: 0.35, lineHeight: 28 },
  headline: { fontSize: 17, fontWeight: '600', color: colors.textPrimary, letterSpacing: -0.41, lineHeight: 22 },
  body: { fontSize: 17, fontWeight: '400', color: colors.textPrimary, letterSpacing: -0.41, lineHeight: 22 },
  callout: { fontSize: 16, fontWeight: '400', color: colors.textPrimary, letterSpacing: -0.32, lineHeight: 21 },
  subhead: { fontSize: 15, fontWeight: '400', color: colors.textSecondary, letterSpacing: -0.24, lineHeight: 20 },
  footnote: { fontSize: 13, fontWeight: '400', color: colors.textSecondary, letterSpacing: -0.08, lineHeight: 18 },
  caption: { fontSize: 12, fontWeight: '500', color: colors.textSecondary, letterSpacing: 0, lineHeight: 16 },
});

const ui = {
  inputHeight: 56,
  buttonHeight: 56,
  borderRadius: 16,
  borderRadiusLg: 24,
  borderRadiusSm: 12,
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  shadowLg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 16,
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 40,
  }
};

export const useTheme = () => {
  const themeMode = useStore((state) => state.themeMode) || 'dark';
  const isDark = themeMode === 'dark';
  const rawColors = isDark ? darkColors : lightColors;

  const colors = {
    ...rawColors,
    cardBg: isDark ? 'rgba(28, 28, 30, 0.75)' : 'rgba(255, 255, 255, 0.95)',
    cardBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
    headerBg: isDark ? 'rgba(18, 18, 22, 0.85)' : 'rgba(255, 255, 255, 0.92)',
    inputBg: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
    inputBgFocused: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.07)',
    modalBg: isDark ? '#1C1C1E' : '#FFFFFF',
    modalOverlay: isDark ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.5)',
    icon: isDark ? '#FFFFFF' : '#1C1C1E',
    iconMuted: isDark ? '#8E8E93' : '#6C6C70',
    shadowColor: isDark ? '#000000' : 'rgba(0, 0, 0, 0.08)',
  };

  const typography = getTypography(colors);

  return { colors, typography, ui, isDark };
};
