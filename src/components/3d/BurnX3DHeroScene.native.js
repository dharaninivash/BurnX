// Native (Android/iOS) fallback — @react-three/fiber requires expo-gl which is web-only.
// Renders a branded animated glow placeholder instead of a 3D canvas.
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/theme';

export default function BurnX3DHeroScene({ height = 400 }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.fallbackContainer,
        {
          height,
          backgroundColor: colors.cardBg || '#0A0A0F',
          borderColor: colors.cardBorder || '#222230',
        },
      ]}
    >
      <View style={styles.glowCircle} />
    </View>
  );
}

const styles = StyleSheet.create({
  fallbackContainer: {
    width: '100%',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
  },
  glowCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 87, 34, 0.25)',
    borderWidth: 2,
    borderColor: '#FF5722',
  },
});
