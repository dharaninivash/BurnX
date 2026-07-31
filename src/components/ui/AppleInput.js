import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Platform, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/theme';

export default function AppleInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  iconName,
  keyboardType = 'default',
  autoCapitalize = 'none',
  maxLength,
  rightIcon,
  onRightIconPress,
  error,
  style,
  inputStyle
}) {
  const { colors, typography, ui } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [focusAnim] = useState(new Animated.Value(0));

  const handleFocus = (e) => {
    setIsFocused(true);
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: false,
    }).start();

    // Auto scroll into view on mobile web / desktop web when focused
    if (Platform.OS === 'web' && e && e.target && e.target.scrollIntoView) {
      try {
        setTimeout(() => {
          e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
      } catch (_) {}
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border || 'rgba(255, 255, 255, 0.12)', colors.primary || '#FF5722']
  });

  const scaleAnim = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.015]
  });

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, { color: isFocused ? colors.primary : colors.textSecondary }]}>{label}</Text>}
      
      <Animated.View
        style={[
          styles.inputWrapper,
          {
            borderColor,
            transform: [{ scale: scaleAnim }],
            backgroundColor: isFocused ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.04)',
            ...(Platform.OS === 'web' ? {
              boxShadow: isFocused 
                ? '0 0 20px rgba(255, 87, 34, 0.4), inset 0 0 15px rgba(255, 87, 34, 0.15)' 
                : '0 4px 15px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)'
            } : {})
          }
        ]}
      >
        {iconName && (
          <Ionicons
            name={iconName}
            size={20}
            color={isFocused ? colors.primary : colors.textSecondary}
            style={styles.leftIcon}
          />
        )}
        
        <TextInput
          style={[
            styles.textInput,
            { color: colors.textPrimary },
            Platform.OS === 'web' && { outlineStyle: 'none' },
            inputStyle
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary || 'rgba(255, 255, 255, 0.4)'}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          maxLength={maxLength}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />

        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIconBtn} activeOpacity={0.7}>
            <Ionicons
              name={rightIcon}
              size={20}
              color={isFocused ? colors.primary : colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </Animated.View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%'
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    height: 56,
    position: 'relative',
    overflow: 'hidden'
  },
  leftIcon: {
    marginRight: 12
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
    fontWeight: '500'
  },
  rightIconBtn: {
    padding: 6,
    marginLeft: 8
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4
  }
});
