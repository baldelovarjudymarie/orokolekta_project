import { Image } from 'expo-image';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../constants/theme';
import { AppText } from './AppText';
import { Icon } from './Icon';

export function AppHeader() {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: colors.canvas,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
      <View
        style={{
          height: 60,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={{ width: 34, height: 34 }}
            contentFit="contain"
          />
          <View>
            <AppText variant="headlineSm" color={colors.body}>
              OroKolekta
            </AppText>
            <AppText variant="labelSm" color={colors.muted} upper style={{ fontSize: 9, lineHeight: 12 }}>
              City of Cagayan de Oro - CLENRO
            </AppText>
          </View>
        </View>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Icon name="person" size={18} color={colors.white} />
        </View>
      </View>
    </View>
  );
}
