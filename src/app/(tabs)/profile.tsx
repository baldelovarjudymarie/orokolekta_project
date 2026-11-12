import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable, Switch, View } from 'react-native';

import { AppText } from '../../components/AppText';
import { Card } from '../../components/Card';
import { Icon } from '../../components/Icon';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenShell } from '../../components/ScreenShell';
import { StatusChip } from '../../components/StatusChip';
import { BARANGAYS } from '../../constants/data';
import { colors, radius } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

type Panel = 'barangay' | 'history' | 'help' | 'about' | null;

function Row({
  icon,
  title,
  subtitle,
  onPress,
  right,
  danger,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onPress?: () => void;
  right?: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => ({
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: pressed ? colors.surfaceLow : colors.white,
      })}>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: danger ? colors.criticalBg : colors.surfaceContainer,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Icon name={icon} size={20} color={danger ? colors.criticalText : colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText variant="labelLg" color={danger ? colors.criticalText : colors.body}>
          {title}
        </AppText>
        <AppText variant="bodySm" color={colors.muted}>
          {subtitle}
        </AppText>
      </View>
      {right ?? (onPress ? <Icon name="chevron-right" size={22} color={colors.muted} /> : null)}
    </Pressable>
  );
}

const Divider = () => <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 66 }} />;

export default function ProfileScreen() {
  const router = useRouter();
  const { state, actions } = useApp();
  const { user, reports } = state;
  const [panel, setPanel] = useState<Panel>(null);
  const [confirmOut, setConfirmOut] = useState(false);

  const toggle = (p: Exclude<Panel, null>) => setPanel((cur) => (cur === p ? null : p));
  const resolved = reports.filter((r) => r.status === 'resolved').length;
  const initials = user.name
    .split(' ')
    .map((w) => w.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const doLogout = () => {
    setConfirmOut(false);
    actions.logout();
    router.replace('/login');
  };

  return (
    <ScreenShell>
      {/* Identity */}
      <Card style={{ gap: 16 }}>
        <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
            <AppText variant="headlineLg" color={colors.white}>
              {initials}
            </AppText>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <AppText variant="headlineMd" color={colors.heading} numberOfLines={1} style={{ flexShrink: 1 }}>
                {user.name}
              </AppText>
              <Icon name="verified" size={18} color={colors.primary} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name="location-on" size={14} color={colors.muted} />
              <AppText variant="bodySm" color={colors.muted}>
                Barangay {user.barangay}, Cagayan de Oro City
              </AppText>
            </View>
            <AppText variant="bodySm" color={colors.muted}>
              {user.mobile} • Verified Citizen
            </AppText>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[
            { v: String(state.pickupsTracked), l: 'Pickups Tracked' },
            { v: String(reports.length), l: 'Reports Filed' },
            { v: `${state.complianceScore}%`, l: 'Segregation Score' },
          ].map((m) => (
            <View key={m.l} style={{ flex: 1, backgroundColor: colors.surfaceLow, borderRadius: radius.input, padding: 10, alignItems: 'center' }}>
              <AppText variant="headlineMd" color={colors.heading}>
                {m.v}
              </AppText>
              <AppText variant="labelSm" color={colors.muted} style={{ textAlign: 'center', fontSize: 10 }}>
                {m.l}
              </AppText>
            </View>
          ))}
        </View>

        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: colors.resolvedBg, borderRadius: radius.input, padding: 12 }}>
          <Icon name="eco" size={22} color={colors.resolvedText} />
          <View style={{ flex: 1 }}>
            <AppText variant="labelMd" color={colors.resolvedText}>
              Eco-Champion Resident • Tier 1
            </AppText>
            <AppText variant="bodySm" color={colors.resolvedText}>
              Compliant with CLENRO Sorting Guidelines
            </AppText>
          </View>
        </View>
      </Card>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <AppText variant="labelSm" color={colors.muted} upper>
          Account & Municipal Settings
        </AppText>
        <AppText variant="labelSm" color={colors.primary} upper>
          {user.zone} Desk
        </AppText>
      </View>

      <Card flat style={{ padding: 0, overflow: 'hidden', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border }}>
        <Row
          icon="notifications-active"
          title="Notification Preferences"
          subtitle={state.notificationsEnabled ? 'Truck alerts, delay notices: ON' : 'All alerts muted'}
          right={
            <Switch
              value={state.notificationsEnabled}
              onValueChange={actions.toggleNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          }
        />
        <Divider />
        <Row icon="pin-drop" title="Change Barangay" subtitle={`Current: Brgy. ${user.barangay} (${user.zone})`} onPress={() => toggle('barangay')} />
        {panel === 'barangay' ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 14, paddingBottom: 14 }}>
            {BARANGAYS.map((b) => {
              const active = b.name === user.barangay;
              return (
                <Pressable
                  key={b.name}
                  onPress={() => actions.setBarangay(b.name)}
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
        ) : null}
        <Divider />
        <Row
          icon="translate"
          title="Language"
          subtitle="Dialect and municipal phrasing"
          right={
            <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceContainer, borderRadius: radius.pill, padding: 3 }}>
              {(
                [
                  { k: 'en', l: 'EN' },
                  { k: 'bis', l: 'Bisaya' },
                ] as const
              ).map((o) => {
                const active = state.language === o.k;
                return (
                  <Pressable
                    key={o.k}
                    onPress={() => actions.setLanguage(o.k)}
                    style={{
                      paddingHorizontal: 10,
                      height: 28,
                      borderRadius: radius.pill,
                      justifyContent: 'center',
                      backgroundColor: active ? colors.primary : 'transparent',
                    }}>
                    <AppText variant="labelSm" color={active ? colors.white : colors.muted}>
                      {o.l}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          }
        />
        <Divider />
        <Row
          icon="history"
          title="My Past Reports & History"
          subtitle={`${reports.length} reports submitted (${resolved} resolved)`}
          onPress={() => toggle('history')}
        />
        {panel === 'history' ? (
          <View style={{ paddingHorizontal: 14, paddingBottom: 14, gap: 10 }}>
            {reports.map((r) => (
              <View key={r.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, backgroundColor: colors.surfaceLow, borderRadius: radius.input, padding: 10 }}>
                <View style={{ flex: 1 }}>
                  <AppText variant="labelMd" color={colors.body} numberOfLines={1}>
                    {r.category}
                  </AppText>
                  <AppText variant="bodySm" color={colors.muted}>
                    {r.id} • {new Date(r.createdAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                  </AppText>
                </View>
                <StatusChip status={r.status} />
              </View>
            ))}
          </View>
        ) : null}
        <Divider />
        <Row icon="support-agent" title="Help & CLENRO Support" subtitle="Hotline: (088) 857-4111 / 0917-888-CDO" onPress={() => toggle('help')} />
        {panel === 'help' ? (
          <View style={{ paddingHorizontal: 14, paddingBottom: 14 }}>
            <AppText variant="bodySm" color={colors.body} style={{ lineHeight: 18 }}>
              CLENRO Action Desk is open Monday to Saturday, 7:00 AM – 5:00 PM. For missed pickups, use the Report tab so field officers can verify your location.
            </AppText>
          </View>
        ) : null}
        <Divider />
        <Row icon="info" title="About OroKolekta & CDO LGU" subtitle="Version 2.4 • City Ordinance Compliance" onPress={() => toggle('about')} />
        {panel === 'about' ? (
          <View style={{ paddingHorizontal: 14, paddingBottom: 14 }}>
            <AppText variant="bodySm" color={colors.body} style={{ lineHeight: 18 }}>
              OroKolekta is the civic waste collection app of the City Government of Cagayan de Oro, built to help residents follow collection schedules, sort correctly, and report issues.
            </AppText>
          </View>
        ) : null}
        <Divider />
        <Row icon="logout" title="Log Out" subtitle="End active civic resident session" danger onPress={() => setConfirmOut(true)} />
      </Card>

      <Card accent style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <Icon name="account-balance" size={24} color={colors.heading} />
        <View style={{ flex: 1 }}>
          <AppText variant="labelMd" color={colors.heading}>
            Data Protected under RA 10173
          </AppText>
          <AppText variant="bodySm" color={colors.heading}>
            Your residential and schedule monitoring data is strictly utilized for public sanitation logistics by CLENRO.
          </AppText>
        </View>
      </Card>

      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
        <Icon name="shield" size={14} color={colors.muted} />
        <AppText variant="labelSm" color={colors.muted} upper>
          Official CLENRO • City of Cagayan de Oro
        </AppText>
      </View>

      {/* Logout confirmation (RN Alert doesn't work on web, so we use our own modal) */}
      <Modal transparent visible={confirmOut} animationType="fade" onRequestClose={() => setConfirmOut(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(74,37,48,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <View style={{ width: '100%', maxWidth: 360, backgroundColor: colors.white, borderRadius: radius.card, padding: 20, gap: 12 }}>
            <AppText variant="headlineMd" color={colors.heading}>
              Log out?
            </AppText>
            <AppText variant="bodyMd" color={colors.body}>
              You will need to sign in again to see your schedule and reports.
            </AppText>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
              <PrimaryButton variant="ghost" label="Cancel" onPress={() => setConfirmOut(false)} style={{ flex: 1 }} />
              <PrimaryButton variant="secondary" label="Log Out" onPress={doLogout} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenShell>
  );
}
