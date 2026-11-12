import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '../constants/theme';
import { AppText } from './AppText';

export function ProgressRing({ value, size = 64 }: { value: number; size?: number }) {
  const r = 15.9155; // circumference = 100
  const pct = Math.max(0, Math.min(100, value));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* The rotation is done on the wrapper View, which works on web and phones */}
      <View style={{ width: size, height: size, transform: [{ rotate: '-90deg' }] }}>
        <Svg width={size} height={size} viewBox="0 0 36 36">
          <Circle cx="18" cy="18" r={r} fill="none" stroke={colors.surfaceContainer} strokeWidth={3.5} />
          <Circle
            cx="18"
            cy="18"
            r={r}
            fill="none"
            stroke={colors.primary}
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeDasharray={`${pct}, 100`}
          />
        </Svg>
      </View>
      <View style={{ position: 'absolute' }}>
        <AppText variant="labelLg" color={colors.heading}>
          {pct}%
        </AppText>
      </View>
    </View>
  );
}
