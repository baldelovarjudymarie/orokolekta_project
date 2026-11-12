import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { AppText } from '../../components/AppText';
import { Card } from '../../components/Card';
import { Icon } from '../../components/Icon';
import { ProgressRing } from '../../components/ProgressRing';
import { ScreenShell } from '../../components/ScreenShell';
import { StatusChip } from '../../components/StatusChip';
import { DAY_LABELS, WASTE_META, WEEKLY_SCHEDULE } from '../../constants/data';
import { colors, radius } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

function buildWeek(today: Date) {
  const offset = (today.getDay() + 6) % 7; // days since Monday
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
    return { date: d.getDate(), dow: d.getDay(), isToday };
  });
}

export default function Dashboard() {
  const router = useRouter();
  const { state, actions } = useApp();
  const { user, truckStatus, reports } = state;

  const now = new Date();
  const week = buildWeek(now);
  const todayKind = WEEKLY_SCHEDULE[now.getDay()];
  const delayed = truckStatus === 'delayed';

  const greeting =
    state.language === 'bis' ? 'Maayong adlaw' : now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';

  const openReports = reports.filter((r) => r.status !== 'resolved').length;
  const latest = reports[0];

  return (
    <ScreenShell>
      {/* Greeting */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="location-on" size={15} color={colors.primary} />
            <AppText variant="labelSm" color={colors.muted} numberOfLines={1}>
              Brgy. {user.barangay}, {user.zone} • Cagayan de Oro
            </AppText>
          </View>
          <AppText variant="labelMd" color={colors.muted} style={{ marginTop: 2 }}>
            {greeting},
          </AppText>
          <AppText variant="headlineLg" color={colors.body} numberOfLines={1}>
            {user.name}
          </AppText>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Pressable
            accessibilityLabel="Notifications"
            onPress={actions.markNotificationsRead}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.surfaceContainer,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Icon name="notifications" size={20} color={colors.body} />
            {state.unreadNotifications > 0 && state.notificationsEnabled ? (
              <View
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  minWidth: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: colors.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 3,
                }}>
                <AppText variant="labelSm" color={colors.white} style={{ fontSize: 9, lineHeight: 12 }}>
                  {state.unreadNotifications}
                </AppText>
              </View>
            ) : null}
          </Pressable>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: '#FC9AAA',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <AppText variant="headlineSm" color="#782E3E">
              {user.name.charAt(0)}
            </AppText>
          </View>
        </View>
      </View>

      {/* Live truck status strip (state: truckStatus) */}
      <View
        style={{
          backgroundColor: delayed ? '#FFDAD6' : '#FFD9E1',
          borderRadius: radius.card,
          padding: 16,
          flexDirection: 'row',
          gap: 12,
        }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: colors.white,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Icon name={delayed ? 'warning' : 'local-shipping'} size={24} color={delayed ? colors.criticalText : colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <AppText variant="labelLg" color="#782E3E" style={{ flex: 1 }}>
              {delayed ? `Collection Delayed: Bulua Flash Rain` : 'Truck arriving in approx. 10 mins'}
            </AppText>
            <Pressable accessibilityLabel="Toggle sample route advisory" onPress={actions.toggleTruckAdvisory} hitSlop={10}>
              <Icon name="swap-horiz" size={20} color={colors.muted} />
            </Pressable>
          </View>
          <AppText variant="bodySm" color="#544244" style={{ marginTop: 2 }}>
            {delayed
              ? `Bulua route paused due to localized heavy rainfall. ${user.zone} truck now expected around 3:15 PM.`
              : `Please prepare your segregated color-coded sacks outside your gate along ${user.zone}.`}
          </AppText>
        </View>
      </View>

      {/* Featured route card */}
      <Card style={{ gap: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: colors.surfaceContainer,
              borderRadius: radius.pill,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}>
            <Icon name="verified" size={14} color={colors.primary} />
            <AppText variant="labelSm" color={colors.primary} upper>
              Regular Route
            </AppText>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: delayed ? colors.reviewBg : colors.resolvedBg,
              borderRadius: radius.pill,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: delayed ? colors.reviewText : colors.resolvedText }} />
            <AppText variant="labelSm" color={delayed ? colors.reviewText : colors.resolvedText} upper>
              {delayed ? 'Delayed • Bulua' : 'En Route • Kauswagan'}
            </AppText>
          </View>
        </View>

        <View>
          <AppText variant="labelSm" color={colors.muted} upper>
            Today&apos;s Designated Window
          </AppText>
          <AppText variant="headlineLg" color={colors.body} style={{ marginTop: 2 }}>
            Next Pickup: Today, {delayed ? '3:15 PM' : '2:00 PM'}
          </AppText>
        </View>

        <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceLow, borderRadius: radius.input, padding: 12, gap: 12 }}>
          <View style={{ flex: 1, gap: 4 }}>
            <AppText variant="labelSm" color={colors.muted}>
              Accepted Bins
            </AppText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: WASTE_META[todayKind].color }} />
              <AppText variant="labelMd" color={colors.body}>
                {WASTE_META[todayKind].label}
              </AppText>
            </View>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <AppText variant="labelSm" color={colors.muted}>
              Collection Perimeter
            </AppText>
            <AppText variant="labelMd" color={colors.body}>
              {user.zone} Main Road
            </AppText>
            <AppText variant="bodySm" color="#544244">
              & Interior Alleys
            </AppText>
          </View>
        </View>

        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <AppText variant="labelSm" color={colors.muted}>
              Bulua Depot
            </AppText>
            <AppText variant="labelSm" color={colors.primary}>
              Kauswagan Hwy
            </AppText>
            <AppText variant="labelSm" color={colors.body}>
              {user.zone} {user.barangay}
            </AppText>
          </View>
          <View style={{ height: 8, borderRadius: radius.pill, backgroundColor: colors.surfaceContainer, overflow: 'hidden' }}>
            <View style={{ height: 8, width: delayed ? '45%' : '75%', borderRadius: radius.pill, backgroundColor: colors.primary }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <AppText variant="bodySm" color={colors.muted}>
              Dispatched 1:15 PM
            </AppText>
            <AppText variant="bodySm" color={colors.muted}>
              Truck #08 (CLENRO)
            </AppText>
          </View>
        </View>
      </Card>

      {/* Weekly schedule */}
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <AppText variant="headlineSm" color={colors.body}>
            This Week&apos;s Collection Schedule
          </AppText>
          <AppText variant="labelSm" color={colors.primary} upper>
            {user.zone}
          </AppText>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
          {week.map((d) => {
            const kind = WEEKLY_SCHEDULE[d.dow];
            const meta = WASTE_META[kind];
            return (
              <View
                key={`${d.dow}-${d.date}`}
                style={{
                  width: d.isToday ? 80 : 64,
                  paddingVertical: 12,
                  borderRadius: radius.input,
                  alignItems: 'center',
                  gap: 4,
                  backgroundColor: d.isToday ? colors.primary : colors.white,
                  opacity: kind === 'none' && !d.isToday ? 0.7 : 1,
                  boxShadow: '0px 2px 8px -2px rgba(122, 48, 64, 0.08)',
                }}>
                <AppText variant="labelSm" color={d.isToday ? '#FFD9DE' : colors.muted}>
                  {d.isToday ? 'TODAY' : DAY_LABELS[d.dow]}
                </AppText>
                <AppText variant="headlineSm" color={d.isToday ? colors.white : colors.body}>
                  {d.isToday ? `${DAY_LABELS[d.dow]} ${d.date}` : d.date}
                </AppText>
                {d.isToday && kind !== 'none' ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 2,
                      backgroundColor: 'rgba(255,255,255,0.25)',
                      borderRadius: radius.pill,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                    }}>
                    <Icon name="local-shipping" size={12} color={colors.white} />
                    <AppText variant="labelSm" color={colors.white} upper style={{ fontSize: 9 }}>
                      Pickup
                    </AppText>
                  </View>
                ) : (
                  <AppText variant="labelSm" color={d.isToday ? colors.white : meta.color} upper style={{ fontSize: 10 }}>
                    {meta.short}
                  </AppText>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* Quick actions */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Pressable
          onPress={() => router.push('/report')}
          style={({ pressed }) => ({
            flex: 1,
            minHeight: 124,
            borderRadius: radius.card,
            padding: 16,
            justifyContent: 'space-between',
            backgroundColor: pressed ? colors.primaryPressed : colors.primary,
          })}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="photo-camera" size={20} color={colors.white} />
            </View>
            <Icon name="arrow-forward" size={18} color="#FFD9DE" />
          </View>
          <View>
            <AppText variant="headlineSm" color={colors.white}>
              Report an Issue
            </AppText>
            <AppText variant="bodySm" color="#FFD9DE" style={{ fontSize: 11, lineHeight: 14 }}>
              Missed pickup or illegal dumping in {user.barangay}
            </AppText>
          </View>
        </Pressable>
        <Pressable
          onPress={() => router.push('/guide')}
          style={({ pressed }) => ({
            flex: 1,
            minHeight: 124,
            borderRadius: radius.card,
            padding: 16,
            justifyContent: 'space-between',
            backgroundColor: pressed ? colors.surfaceLow : colors.white,
            boxShadow: '0px 4px 16px -2px rgba(122, 48, 64, 0.05)',
          })}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="autorenew" size={20} color={colors.primary} />
            </View>
            <Icon name="arrow-forward" size={18} color={colors.muted} />
          </View>
          <View>
            <AppText variant="headlineSm" color={colors.body}>
              Sorting Guide
            </AppText>
            <AppText variant="bodySm" color={colors.muted} style={{ fontSize: 11, lineHeight: 14 }}>
              What goes where in CDO city bins
            </AppText>
          </View>
        </Pressable>
      </View>

      {/* My reports summary (shared state: reports) */}
      <Card style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <AppText variant="headlineSm" color={colors.body}>
            My Reports
          </AppText>
          <Pressable onPress={() => router.push('/profile')}>
            <AppText variant="labelSm" color={colors.primary} upper>
              View history
            </AppText>
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1, backgroundColor: colors.surfaceLow, borderRadius: radius.input, padding: 12 }}>
            <AppText variant="headlineLg" color={colors.heading}>
              {reports.length}
            </AppText>
            <AppText variant="labelSm" color={colors.muted}>
              Reports Filed
            </AppText>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.surfaceLow, borderRadius: radius.input, padding: 12 }}>
            <AppText variant="headlineLg" color={colors.heading}>
              {openReports}
            </AppText>
            <AppText variant="labelSm" color={colors.muted}>
              Still Open
            </AppText>
          </View>
        </View>
        {latest ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <AppText variant="labelMd" color={colors.body} numberOfLines={1}>
                {latest.category}
              </AppText>
              <AppText variant="bodySm" color={colors.muted}>
                {latest.id}
              </AppText>
            </View>
            <StatusChip status={latest.status} />
          </View>
        ) : null}
      </Card>

      {/* Compliance */}
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <ProgressRing value={state.complianceScore} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <AppText variant="labelSm" color={colors.primary} upper>
              Barangay Score
            </AppText>
            <Icon name="eco" size={14} color={colors.primary} />
          </View>
          <AppText variant="headlineSm" color={colors.body} numberOfLines={1}>
            {user.barangay} Compliance Rating
          </AppText>
          <AppText variant="bodySm" color={colors.muted} numberOfLines={2}>
            Rank #2 across 80 Cagayan de Oro barangays this month
          </AppText>
        </View>
      </Card>

      {/* Ordinance advisory */}
      <Card flat style={{ backgroundColor: colors.surfaceContainer, flexDirection: 'row', gap: 12 }}>
        <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#B55669', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="gavel" size={18} color={colors.white} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="labelSm" color={colors.primary} upper>
            CLENRO CDO Advisory
          </AppText>
          <AppText variant="bodySm" color="#782E3E" style={{ marginTop: 2, lineHeight: 18 }}>
            Strict compliance with solid waste segregation is mandated under City Ordinance No. 13311-2018. Unsegregated waste will not be collected.
          </AppText>
          <AppText variant="labelSm" color={colors.muted} style={{ marginTop: 6 }}>
            Penalty: ₱1,500 - ₱5,000
          </AppText>
        </View>
      </Card>
    </ScreenShell>
  );
}
