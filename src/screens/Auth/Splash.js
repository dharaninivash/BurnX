import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../theme/theme';

export default function Splash({ navigation }) {
  const { colors, typography, ui } = useTheme();
  const styles = typeof getStyles !== 'undefined' ? getStyles(colors, typography, ui) : {};
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2000);
    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, navigation]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.logo}>BURN<Text style={styles.logoHighlight}>X</Text></Text>
      </Animated.View>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [15, 0] }) }] }}>
        <Text style={styles.tagline}>Train Smart. Live Strong.</Text>
      </Animated.View>
    </View>
  );
}

const getStyles = (colors, typography, ui) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: ui.spacing.m,
  },
  logo: {
    ...typography.largeTitle,
    fontSize: 48,
    color: colors.textPrimary,
    letterSpacing: 2,
  },
  logoHighlight: {
    color: colors.primary,
  },
  tagline: {
    ...typography.subhead,
    color: colors.textSecondary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  }
});
