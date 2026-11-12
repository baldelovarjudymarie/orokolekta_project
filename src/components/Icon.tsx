import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleProp, TextStyle } from 'react-native';

import { colors } from '../constants/theme';

interface Props {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

/** Thin wrapper around Material Icons (same icon family used by the Stitch design). */
export function Icon({ name, size = 24, color = colors.body, style }: Props) {
  return <MaterialIcons name={name as any} size={size} color={color} style={style} />;
}
