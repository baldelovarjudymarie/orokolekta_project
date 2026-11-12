import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { Icon } from '../components/Icon';
import { LoadingScreen } from '../components/LoadingScreen';
import { PrimaryButton } from '../components/PrimaryButton';
import { BARANGAYS } from '../constants/data';
import { colors, fonts, radius } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { Account, accountToUser, formatMobile, registerAccount, setLastAccount } from '../storage/accounts';

export default function Register() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { actions } = useApp();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [citizenId, setCitizenId] = useState('');
  const [barangay, setBarangay] = useState(BARANGAYS[0].name);
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const [creating, setCreating] = useState<Account | null>(null);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const submit = async () => {
    setError(null);
    const cleanName = name.trim().replace(/\s+/g, ' ');
    if (cleanName.length < 2) return setError('Please enter your full name.');
    if (!/^9\d{9}$/.test(mobile)) return setError('Enter a valid 10-digit mobile number starting with 9.');
    if (pin.length < 6) return setError('Your MPIN / password must be at least 6 characters.');
    if (pin !== pin2) return setError('The two MPIN entries do not match.');

    const account: Account = {
      name: cleanName,
      mobile,
      citizenId: citizenId.trim().toLowerCase(),
      pin,
      barangay,
    };
    const result = await registerAccount(account);
    if (!result.ok) return setError(result.error);

    setLastAccount(account.mobile);
    setCreating(account);
    timer.current = setTimeout(() => {
      actions.login(accountToUser(account), false);
      router.replace('/(tabs)');
    }, 1600);
  };

  if (creating) {
    return <LoadingScreen duration={1500} messages={['Creating your household account…', 'Setting up your dashboard…']} />;
  }

  const inputStyle = (key: string) => ({
    height: 48,
    borderRadius: radius.input,
    borderWidth: 1.5,
    borderColor: focused === key ? colors.primary : colors.border,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.body,
  });
  const bind = (key: string) => ({
    onFocus: () => setFocused(key),
    onBlur: () => setFocused(null),
    placeholderTextColor: colors.muted,
  });

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.canvas }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32, gap: 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.replace('/login')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Icon name="arrow-back" size={20} color={colors.heading} />
          <AppText variant="labelMd" color={colors.heading}>
            Back to Log In
          </AppText>
        </Pressable>

        <View style={{ gap: 6 }}>
          <AppText variant="display" color={colors.heading}>
            Register Household
          </AppText>
          <AppText variant="bodyMd" color={colors.muted}>
            Create your OroKolekta account so your name, barangay and reports are saved on this device.
          </AppText>
        </View>

        <Card style={{ gap: 14 }}>
          <View style={{ gap: 6 }}>
            <AppText variant="labelMd" color={colors.heading}>
              Full Name
            </AppText>
            <TextInput style={inputStyle('name')} value={name} onChangeText={setName} placeholder="e.g. Juan Dela Cruz" autoCapitalize="words" {...bind('name')} />
          </View>

          <View style={{ gap: 6 }}>
            <AppText variant="labelMd" color={colors.heading}>
              Mobile Number
            </AppText>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View
                style={{
                  height: 48,
                  paddingHorizontal: 12,
                  borderRadius: radius.input,
                  borderWidth: 1.5,
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceLow,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <AppText variant="labelLg">+63</AppText>
              </View>
              <TextInput
                style={[inputStyle('mobile'), { flex: 1 }]}
                value={formatMobile(mobile)}
                onChangeText={(t) => setMobile(t.replace(/\D/g, '').slice(0, 10))}
                placeholder="9XX XXX XXXX"
                keyboardType="number-pad"
                maxLength={12}
                {...bind('mobile')}
              />
            </View>
          </View>

          <View style={{ gap: 6 }}>
            <AppText variant="labelMd" color={colors.heading}>
              Oro Citizen ID or Email <AppText variant="labelMd" color={colors.muted}>(Optional)</AppText>
            </AppText>
            <TextInput
              style={inputStyle('cid')}
              value={citizenId}
              onChangeText={setCitizenId}
              placeholder="CDO-2024-XXXXX or name@email.com"
              autoCapitalize="none"
              autoCorrect={false}
              {...bind('cid')}
            />
          </View>

          <View style={{ gap: 6 }}>
            <AppText variant="labelMd" color={colors.heading}>
              Barangay
            </AppText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {BARANGAYS.map((b) => {
                const active = b.name === barangay;
                return (
                  <Pressable
                    key={b.name}
                    onPress={() => setBarangay(b.name)}
                    style={{
                      paddingHorizontal: 14,
                      height: 34,
                      borderRadius: radius.pill,
                      justifyContent: 'center',
                      backgroundColor: active ? colors.primary : colors.tint,
                    }}>
                    <AppText variant="labelMd" color={active ? colors.white : colors.heading}>
                      {b.name}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={{ gap: 6 }}>
            <AppText variant="labelMd" color={colors.heading}>
              Create MPIN / Password (6+ characters)
            </AppText>
            <TextInput style={inputStyle('pin')} value={pin} onChangeText={setPin} placeholder="••••••" secureTextEntry autoCapitalize="none" {...bind('pin')} />
          </View>
          <View style={{ gap: 6 }}>
            <AppText variant="labelMd" color={colors.heading}>
              Confirm MPIN / Password
            </AppText>
            <TextInput style={inputStyle('pin2')} value={pin2} onChangeText={setPin2} placeholder="••••••" secureTextEntry autoCapitalize="none" {...bind('pin2')} />
          </View>

          {error ? (
            <View
              style={{
                flexDirection: 'row',
                gap: 8,
                padding: 12,
                borderRadius: radius.input,
                backgroundColor: colors.criticalBg,
                borderWidth: 1,
                borderColor: colors.criticalBorder,
              }}>
              <Icon name="error-outline" size={18} color={colors.criticalText} />
              <AppText variant="bodySm" color={colors.criticalText} style={{ flex: 1 }}>
                {error}
              </AppText>
            </View>
          ) : null}

          <PrimaryButton label="Create Account" icon="arrow-forward" onPress={submit} />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
