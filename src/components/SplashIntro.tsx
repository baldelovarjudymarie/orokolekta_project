import { Image } from 'expo-image';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, View } from 'react-native';

import { colors } from '../constants/theme';
import { AppText } from './AppText';

/** Animated splash screen shown right after the native splash. Calls onDone when finished. */
export function SplashIntro({ onDone }: { onDone: () => void }) {
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const nativeDriver = Platform.OS !== 'web';

  useEffect(() => {
    const anim = Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: nativeDriver }),
        Animated.spring(scale, { toValue: 1, friction: 6, tension: 60, useNativeDriver: nativeDriver }),
      ]),
      Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: nativeDriver }),
      Animated.delay(700),
    ]);
    anim.start(({ finished }) => {
      if (finished) onDone();
    });
    return () => anim.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <Image
          source={require('../../assets/images/splash-icon.png')}
          style={{ width: 180, height: 180 }}
          contentFit="contain"
        />
      </Animated.View>
      <Animated.View style={{ opacity: textOpacity, alignItems: 'center', marginTop: 8 }}>
        <AppText variant="display" color={colors.white}>
          OroKolekta
        </AppText>
        <AppText variant="bodyMd" color={colors.tint} style={{ marginTop: 4, textAlign: 'center' }}>
          Civic Waste Collection • City of Cagayan de Oro
        </AppText>
      </Animated.View>
    </View>
  );
}
