import React, { useState } from 'react';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';

export default function AppleCard({
  children,
  style,
  onPress,
  glowColor = 'rgba(255, 87, 34, 0.15)',
  glass = true,
  interactive = true,
  ...props
}) {
  const [isHovered, setIsHovered] = useState(false);

  const isWeb = Platform.OS === 'web';

  const webStyle = isWeb
    ? {
        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isHovered && interactive ? 'translateY(-4px) scale(1.015)' : 'translateY(0px) scale(1)',
        backdropFilter: glass ? 'blur(20px) saturate(180%)' : 'none',
        WebkitBackdropFilter: glass ? 'blur(20px) saturate(180%)' : 'none',
        boxShadow: isHovered && interactive
          ? `0 20px 40px -12px ${glowColor}, 0 0 0 1px rgba(255, 255, 255, 0.15)`
          : '0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        cursor: onPress && interactive ? 'pointer' : 'default',
      }
    : {};

  const cardContent = (
    <View
      style={[
        styles.card,
        glass && styles.glassCard,
        style,
        webStyle,
      ]}
      {...(isWeb && interactive
        ? {
            onMouseEnter: () => setIsHovered(true),
            onMouseLeave: () => setIsHovered(false),
          }
        : {})}
      {...props}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  glassCard: {
    backgroundColor: 'rgba(28, 28, 30, 0.75)',
  },
});
