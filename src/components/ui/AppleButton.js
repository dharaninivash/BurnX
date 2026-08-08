import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/theme';

export default function AppleButton({
  title,
  onPress,
  icon,
  variant = 'primary', // primary | secondary | outline | glass
  loading = false,
  disabled = false,
  style,
  textStyle,
}) {
  const { colors, isDark } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const isWeb = Platform.OS === 'web';

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: '#FF5722',
          text: '#FFFFFF',
          border: 'transparent',
          glow: 'rgba(255, 87, 34, 0.4)',
        };
      case 'secondary':
        return {
          bg: isDark ? '#2C2C2E' : '#E5E5EA',
          text: isDark ? '#FFFFFF' : '#1C1C1E',
          border: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
          glow: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)',
        };
      case 'outline':
        return {
          bg: 'transparent',
          text: '#FF5722',
          border: '#FF5722',
          glow: 'rgba(255, 87, 34, 0.25)',
        };
      case 'glass':
        return {
          bg: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
          text: isDark ? '#FFFFFF' : '#1C1C1E',
          border: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
          glow: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
        };
      default:
        return {
          bg: '#FF5722',
          text: '#FFFFFF',
          border: 'transparent',
          glow: 'rgba(255, 87, 34, 0.4)',
        };
    }
  };

  const vConfig = getVariantStyles();

  const webStyle = isWeb
    ? {
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isHovered && !disabled ? 'scale(1.03) translateY(-2px)' : 'scale(1) translateY(0)',
        boxShadow: isHovered && !disabled
          ? `0 12px 24px -6px ${vConfig.glow}`
          : isDark ? '0 4px 12px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.06)',
        backdropFilter: variant === 'glass' ? 'blur(12px)' : 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }
    : {};

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={disabled || loading ? null : onPress}
      style={[
        styles.button,
        {
          backgroundColor: vConfig.bg,
          borderColor: vConfig.border,
          borderWidth: variant === 'outline' || variant === 'secondary' || variant === 'glass' ? 1.5 : 0,
          opacity: disabled ? 0.5 : 1,
        },
        style,
        webStyle,
      ]}
      {...(isWeb
        ? {
            onMouseEnter: () => setIsHovered(true),
            onMouseLeave: () => setIsHovered(false),
          }
        : {})}
    >
      {loading ? (
        <ActivityIndicator color={vConfig.text} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {icon && <Ionicons name={icon} size={20} color={vConfig.text} style={styles.icon} />}
          <Text style={[styles.text, { color: vConfig.text }, textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
