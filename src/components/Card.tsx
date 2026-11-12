import React from 'react';
import { StyleProp, View, ViewProps, ViewStyle } from 'react-native';

import { cardShadow, colors, radius } from '../constants/theme';

interface Props extends ViewProps {
  accent?: boolean;
  flat?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Card({ accent, flat, style, children, ...rest }: Props) {
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: accent ? colors.tint : colors.surface,
          borderRadius: radius.card,
          padding: 16,
        },
        !accent && !flat ? ({ boxShadow: cardShadow } as ViewStyle) : null,
        style,
      ]}>
      {children}
    </View>
  );
}
