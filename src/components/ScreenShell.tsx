import React from 'react';
import { ScrollView, View } from 'react-native';

import { colors } from '../constants/theme';
import { AppHeader } from './AppHeader';

/** Common layout for the four tab screens: fixed header + scrolling content with 20px margins. */
export function ScreenShell({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.canvas }}>
      <AppHeader />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 32, gap: 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </View>
  );
}
