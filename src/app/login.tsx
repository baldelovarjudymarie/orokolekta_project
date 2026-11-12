import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';

import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { Icon } from '../components/Icon';
import { LoadingScreen } from '../components/LoadingScreen';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, fonts, radius } from '../constants/theme';
import { useApp } from '../context/AppContext';
import {
  Account,
  accountToUser,
  findAccount,
  formatMobile,
  getLastAccount,
  setLastAccount,
} from '../storage/accounts';

type Mode = 'mobile' | 'citizen';

export default function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { actions } = useApp();

  const [mode, setMode] = useState<Mode>('mobile');
  const [mobile, setMobile] = useState(''); // digits only
  const [citizenId, setCitizenId] = useState('');
  const [mpin, setMpin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    const list = timers.current;
    return () => list.forEach(clearTimeout);
  }, []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  };

  const showToast = (msg: string) => {
    setToast(msg);
    later(() => setToast(null), 2600);
  };

  const completeLogin = (account: Account) => {
    setSigningIn(true);
    setLastAccount(account.mobile);
    later(() => {
      actions.login(accountToUser(account), !!account.demo);
      router.replace('/(tabs)');
    }, 1600);
  };

  const submit = async () => {
    setError(null);
    if (mode === 'mobile') {
      if (!/^9\d{9}$/.test(mobile)) {
        setError('Enter your 10-digit mobile number starting with 9 (e.g. 917 555 3829).');
        return;
      }
    } else if (citizenId.trim().length < 5) {
      setError('Enter your Oro Citizen ID (CDO-2024-XXXXX) or email address.');
      return;
    }
    if (mpin.length < 6) {
      setError('Your MPIN / password must be at least 6 characters.');
      return;
    }
    const result = await findAccount(mode, mode === 'mobile' ? mobile : citizenId, mpin);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    completeLogin(result.account);
  };

  const biometricLogin = async () => {
    const last = await getLastAccount();
    if (!last) {
      showToast('Log in with your MPIN once first, then biometrics can be used.');
      return;
    }
    showToast(`Biometrics verified for ${last.name}.`);
    completeLogin(last);
  };

  if (signingIn) {
    return (
      <LoadingScreen
        duration={1500}
        messages={['Verifying your credentials…', 'Loading your dashboard…']}
      />
    );
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

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.canvas }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32, gap: 20 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Image source={require('../../assets/images/logo.png')} style={{ width: 84, height: 84 }} contentFit="contain" />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: colors.surfaceContainer,
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: radius.pill,
            }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary }} />
            <AppText variant="labelSm" color={colors.primary} upper>
              CLENRO • CDO LGU
            </AppText>
          </View>
          <AppText variant="display" color={colors.heading} style={{ textAlign: 'center' }}>
            Welcome Back, Resident
          </AppText>
          <AppText variant="bodyMd" color={colors.muted} style={{ textAlign: 'center' }}>
            Access your barangay waste collection schedule, real-time truck tracking, and CLENRO reports.
          </AppText>
        </View>

        <Card style={{ gap: 16 }}>
          {/* Mode tabs */}
          <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceContainer, borderRadius: radius.input, padding: 4 }}>
            {(
              [
                { key: 'mobile', label: 'Mobile Number', icon: 'smartphone' },
                { key: 'citizen', label: 'Citizen ID / Email', icon: 'badge' },
              ] as const
            ).map((t) => {
              const active = mode === t.key;
              return (
                <Pressable
                  key={t.key}
                  accessibilityRole="tab"
                  onPress={() => {
                    setMode(t.key);
                    setError(null);
                  }}
                  style={{
                    flex: 1,
                    height: 40,
                    borderRadius: 9,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    backgroundColor: active ? colors.white : 'transparent',
                  }}>
                  <Icon name={t.icon} size={16} color={active ? colors.primary : colors.muted} />
                  <AppText variant="labelMd" color={active ? colors.primary : colors.muted}>
                    {t.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          {mode === 'mobile' ? (
            <View style={{ gap: 6 }}>
              <AppText variant="labelMd" color={colors.heading}>
                Registered Mobile Number
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
                    flexDirection: 'row',
                    gap: 6,
                  }}>
                  <AppText variant="bodyMd">🇵🇭</AppText>
                  <AppText variant="labelLg">+63</AppText>
                </View>
                <TextInput
                  style={[inputStyle('mobile'), { flex: 1 }]}
                  value={formatMobile(mobile)}
                  onChangeText={(t) => setMobile(t.replace(/\D/g, '').slice(0, 10))}
                  onFocus={() => setFocused('mobile')}
                  onBlur={() => setFocused(null)}
                  placeholder="9XX XXX XXXX"
                  placeholderTextColor={colors.muted}
                  keyboardType="number-pad"
                  maxLength={12}
                />
              </View>
              <AppText variant="bodySm" color={colors.muted}>
                Use your registered 10-digit Philippine phone number.
              </AppText>
            </View>
          ) : (
            <View style={{ gap: 6 }}>
              <AppText variant="labelMd" color={colors.heading}>
                Oro Citizen ID or Email
              </AppText>
              <TextInput
                style={inputStyle('citizen')}
                value={citizenId}
                onChangeText={setCitizenId}
                onFocus={() => setFocused('citizen')}
                onBlur={() => setFocused(null)}
                placeholder="CDO-2024-XXXXX or name@cdo.gov.ph"
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          )}

          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <AppText variant="labelMd" color={colors.heading}>
                6-Digit MPIN / Password
              </AppText>
              <Pressable onPress={() => showToast('MPIN reset link sent to your registered contact.')}>
                <AppText variant="labelMd" color={colors.primary}>
                  Forgot MPIN?
                </AppText>
              </Pressable>
            </View>
            <View>
              <TextInput
                style={[inputStyle('mpin'), { paddingRight: 48 }]}
                value={mpin}
                onChangeText={setMpin}
                onFocus={() => setFocused('mpin')}
                onBlur={() => setFocused(null)}
                placeholder="••••••"
                placeholderTextColor={colors.muted}
                secureTextEntry={!showPin}
                autoCapitalize="none"
                maxLength={32}
                onSubmitEditing={submit}
              />
              <Pressable
                accessibilityLabel={showPin ? 'Hide password' : 'Show password'}
                onPress={() => setShowPin((s) => !s)}
                style={{ position: 'absolute', right: 0, top: 0, width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={showPin ? 'visibility-off' : 'visibility'} size={20} color={colors.muted} />
              </Pressable>
            </View>
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

          <PrimaryButton label="Log In to OroKolekta" icon="arrow-forward" onPress={submit} />

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
            <AppText variant="labelSm" color={colors.muted} upper>
              Fast Sign-in
            </AppText>
            <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          </View>

          <PrimaryButton
            variant="tertiary"
            label="Log in via One-Time SMS Code (OTP)"
            icon="sms"
            onPress={() => showToast('SMS verification dispatched to your registered mobile number.')}
          />
          <PrimaryButton
            variant="ghost"
            label="Quick Login with Biometrics"
            icon="fingerprint"
            onPress={biometricLogin}
          />
          <AppText variant="bodySm" color={colors.muted} style={{ textAlign: 'center' }}>
            Demo account: 917 555 3829 • MPIN 123456
          </AppText>
        </Card>

        <Card accent style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Icon name="verified-user" size={24} color={colors.heading} />
          <View style={{ flex: 1 }}>
            <AppText variant="labelMd" color={colors.heading}>
              CLENRO Secure Civic Portal
            </AppText>
            <AppText variant="bodySm" color={colors.heading}>
              Protected under Republic Act 10173 (Data Privacy Act of 2012). City Government of Cagayan de Oro.
            </AppText>
          </View>
        </Card>

        <View style={{ alignItems: 'center', gap: 4 }}>
          <AppText variant="bodySm" color={colors.muted}>
            New resident or recently relocated household?
          </AppText>
          <Pressable onPress={() => router.push('/register')}>
            <AppText variant="labelMd" color={colors.primary}>
              Register your Household with Barangay CLENRO →
            </AppText>
          </Pressable>
        </View>
      </ScrollView>

      {toast ? (
        <View
          style={{
            position: 'absolute',
            left: 20,
            right: 20,
            bottom: insets.bottom + 20,
            backgroundColor: colors.body,
            borderRadius: radius.input,
            padding: 14,
            flexDirection: 'row',
            gap: 8,
            alignItems: 'center',
          }}>
          <Icon name="info" size={18} color={colors.white} />
          <AppText variant="bodySm" color={colors.white} style={{ flex: 1 }}>
            {toast}
          </AppText>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}
