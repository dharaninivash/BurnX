// Native (Android/iOS) fallback — @react-three/fiber requires expo-gl which is web-only.
// Renders a branded placeholder instead of a 3D canvas.
import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function BurnX3DFitnessWidget({ width = 100, height = 100 }) {
  return <View style={[styles.fallback, { width, height }]} />;
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: 'rgba(255, 87, 34, 0.12)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 87, 34, 0.3)',
  },
});
