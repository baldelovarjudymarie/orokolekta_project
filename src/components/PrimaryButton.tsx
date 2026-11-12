import React from 'react';
import { Pressable, StyleProp, View, ViewStyle } from 'react-native';

import { colors, radius } from '../constants/theme';
import { AppText } from './AppText';
import { Icon } from './Icon';

interface Props {
  label: string;
  onPress: () => void;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function PrimaryButton({ label, onPress, icon, variant = 'primary', disabled, style }: Props) {
  const palette = {
    primary: { bg: colors.primary, pressed: colors.primaryPressed, text: colors.white, border: 'transparent' },
    secondary: { bg: colors.heading, pressed: '#632633', text: colors.white, border: 'transparent' },
    tertiary: { bg: colors.tint, pressed: colors.tintSoft, text: colors.heading, border: 'transparent' },
    ghost: { bg: 'transparent', pressed: colors.surfaceLow, text: colors.heading, border: colors.border },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          height: 48,
          borderRadius: radius.input,
          backgroundColor: pressed ? palette.pressed : palette.bg,
          borderWidth: variant === 'ghost' ? 1.5 : 0,
          borderColor: palette.border,
          opacity: disabled ? 0.55 : 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 16,
        },
        style,
      ]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <AppText variant="labelLg" color={palette.text}>
          {label}
        </AppText>
        {icon ? <Icon name={icon} size={18} color={palette.text} /> : null}
      </View>
    </Pressable>
  );
}
