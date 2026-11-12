import { Image } from 'expo-image';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, View } from 'react-native';

import { colors, radius } from '../constants/theme';
import { AppText } from './AppText';

interface Props {
  /** Messages cycled while loading. */
  messages?: string[];
  /** How long the progress bar takes to fill (ms). */
  duration?: number;
}

const DEFAULT_MESSAGES = [
  'Connecting to CLENRO servers…',
  'Loading your barangay schedule…',
  'Locating the nearest collection truck…',
];

export function LoadingScreen({ messages = DEFAULT_MESSAGES, duration = 1800 }: Props) {
  const progress = useRef(new Animated.Value(0)).current;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // width can't use the native driver, so this animation runs on the JS thread (it's tiny).
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    });
    anim.start();
    const step = Math.max(600, Math.floor(duration / messages.length));
    const timer = setInterval(() => {
      setIndex((i) => (i + 1 < messages.length ? i + 1 : i));
    }, step);
    return () => {
      anim.stop();
      clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <Image source={require('../../assets/images/logo.png')} style={{ width: 88, height: 88 }} contentFit="contain" />
      <AppText variant="headlineLg" color={colors.heading} style={{ marginTop: 16 }}>
        OroKolekta
      </AppText>
      <View style={{ marginTop: 28, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <ActivityIndicator color={colors.primary} />
        <AppText variant="bodyMd" color={colors.muted}>
          {messages[Math.min(index, messages.length - 1)]}
        </AppText>
      </View>
      <View
        style={{
          marginTop: 16,
          width: '70%',
          maxWidth: 280,
          height: 8,
          borderRadius: radius.pill,
          backgroundColor: colors.surfaceContainer,
          overflow: 'hidden',
        }}>
        <Animated.View style={{ width, height: 8, borderRadius: radius.pill, backgroundColor: colors.primary }} />
      </View>
      <AppText variant="labelSm" color={colors.muted} upper style={{ position: 'absolute', bottom: 32 }}>
        CLENRO • City Government of Cagayan de Oro
      </AppText>
    </View>
  );
}
