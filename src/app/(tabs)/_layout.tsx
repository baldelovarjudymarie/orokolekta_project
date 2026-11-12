import { Redirect, Tabs } from 'expo-router';
import React from 'react';

import { Icon } from '../../components/Icon';
import { colors, fonts } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export default function TabsLayout() {
  const { state } = useApp();

  // Route guard: signed-out users go back to the login screen.
  if (!state.isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: fonts.bold, fontSize: 11 },
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: ({ color }) => <Icon name="local-shipping" size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="report"
        options={{ title: 'Report', tabBarIcon: ({ color }) => <Icon name="report" size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="guide"
        options={{ title: 'Guide', tabBarIcon: ({ color }) => <Icon name="menu-book" size={24} color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color }) => <Icon name="account-circle" size={24} color={color} /> }}
      />
    </Tabs>
  );
}
