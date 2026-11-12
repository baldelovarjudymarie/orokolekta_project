import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';

import { colors, fonts } from '../constants/theme';

export type Variant =
  | 'display'
  | 'headlineLg'
  | 'headlineMd'
  | 'headlineSm'
  | 'bodyLg'
  | 'bodyMd'
  | 'bodySm'
  | 'labelLg'
  | 'labelMd'
  | 'labelSm';

const variants: Record<Variant, TextStyle> = {
  display: { fontFamily: fonts.bold, fontSize: 28, lineHeight: 36, letterSpacing: -0.3 },
  headlineLg: { fontFamily: fonts.bold, fontSize: 22, lineHeight: 28 },
  headlineMd: { fontFamily: fonts.semibold, fontSize: 20, lineHeight: 26 },
  headlineSm: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22 },
  bodyLg: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  bodyMd: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  bodySm: { fontFamily: fonts.regular, fontSize: 12, lineHeight: 16 },
  labelLg: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20, letterSpacing: 0.14 },
  labelMd: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16, letterSpacing: 0.24 },
  labelSm: { fontFamily: fonts.bold, fontSize: 11, lineHeight: 14, letterSpacing: 0.44 },
};

interface Props extends TextProps {
  variant?: Variant;
  color?: string;
  upper?: boolean;
}

export function AppText({ variant = 'bodyMd', color = colors.body, upper, style, children, ...rest }: Props) {
  return (
    <Text
      {...rest}
      style={[variants[variant], { color }, upper ? { textTransform: 'uppercase' } : null, style]}>
      {children}
    </Text>
  );
}
