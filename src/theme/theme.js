import { useStore } from '../store/useStore';

const baseColors = {
  primary: '#FF7A00', // Original FitAxis Orange
  error: '#FF4C4C',
  success: '#4CAF50',
  warning: '#FFC107',
};

const darkColors = {
  ...baseColors,
  background: '#121212',
  surface: '#1E1E1E',
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0A0',
  border: '#2C2C2C',
};

const lightColors = {
  ...baseColors,
  background: '#F5F5F5',
  surface: '#FFFFFF',
  textPrimary: '#121212',
  textSecondary: '#555555',
  border: '#E0E0E0',
};

const getTypography = (colors) => ({
  header: { fontSize: 24, fontWeight: 'bold', color: colors.textPrimary },
  title: { fontSize: 20, fontWeight: '600', color: colors.textPrimary },
  body: { fontSize: 16, color: colors.textPrimary },
  caption: { fontSize: 14, color: colors.textSecondary },
});

const ui = {
  borderRadius: 16,
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  }
};

export const useTheme = () => {
  const themeMode = useStore((state) => state.themeMode) || 'dark';
  const colors = themeMode === 'light' ? lightColors : darkColors;
  const typography = getTypography(colors);
  
  return { colors, typography, ui };
};
