import React, { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import { AppText } from '../../components/AppText';
import { Card } from '../../components/Card';
import { Icon } from '../../components/Icon';
import { ScreenShell } from '../../components/ScreenShell';
import { GUIDE } from '../../constants/data';
import { colors, fonts, radius } from '../../constants/theme';

type Filter = 'all' | 'bio' | 'recycle' | 'residual';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All Categories' },
  { key: 'bio', label: 'Biodegradable' },
  { key: 'recycle', label: 'Recyclable' },
  { key: 'residual', label: 'Residual & Special' },
];

export default function GuideScreen() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [focused, setFocused] = useState(false);

  const q = query.trim().toLowerCase();
  const visible = GUIDE.filter((c) => filter === 'all' || c.id === filter)
    .map((c) => {
      if (!q) return { cat: c, examples: c.examples };
      const matches = c.examples.filter((e) => e.toLowerCase().includes(q));
      const titleMatch = c.title.toLowerCase().includes(q) || c.local.toLowerCase().includes(q);
      return { cat: c, examples: titleMatch ? c.examples : matches };
    })
    .filter((x) => x.examples.length > 0);

  return (
    <ScreenShell>
      <View style={{ gap: 6 }}>
        <View
          style={{
            alignSelf: 'flex-start',
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
            CLENRO Official Directive
          </AppText>
        </View>
        <AppText variant="display" color={colors.heading}>
          Waste Segregation Guide
        </AppText>
        <AppText variant="bodyMd" color={colors.muted}>
          City of Cagayan de Oro Ecological Solid Waste Management compliance guidelines (RA 9003 & City Ordinance).
        </AppText>
      </View>

      {/* Search */}
      <View
        style={{
          height: 48,
          borderRadius: radius.input,
          borderWidth: 1.5,
          borderColor: focused ? colors.primary : colors.border,
          backgroundColor: colors.white,
          paddingHorizontal: 14,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}>
        <Icon name="search" size={20} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search item (e.g. Styrofoam, battery)..."
          placeholderTextColor={colors.muted}
          style={{ flex: 1, fontFamily: fonts.regular, fontSize: 14, color: colors.body, height: 48 }}
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityLabel="Clear search">
            <Icon name="cancel" size={20} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={{
                height: 36,
                paddingHorizontal: 16,
                borderRadius: radius.pill,
                justifyContent: 'center',
                backgroundColor: active ? colors.primary : colors.tint,
              }}>
              <AppText variant="labelMd" color={active ? colors.white : colors.heading}>
                {f.label}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>

      {visible.length === 0 ? (
        <Card accent style={{ alignItems: 'center', gap: 6 }}>
          <Icon name="search-off" size={28} color={colors.heading} />
          <AppText variant="bodyMd" color={colors.heading} style={{ textAlign: 'center' }}>
            No items found matching your search. Try checking general categories below.
          </AppText>
        </Card>
      ) : null}

      {visible.map(({ cat, examples }) => (
        <Card key={cat.id} style={{ gap: 12, paddingLeft: 20, overflow: 'hidden' }}>
          <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: cat.color }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.surfaceContainer, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={cat.icon} size={22} color={cat.color} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="headlineSm" color={colors.heading}>
                  {cat.title}
                </AppText>
                <AppText variant="labelSm" color={colors.muted} upper>
                  {cat.local}
                </AppText>
              </View>
            </View>
            <View style={{ backgroundColor: colors.surfaceContainer, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 }}>
              <AppText variant="labelSm" color={colors.primary}>
                {cat.schedule}
              </AppText>
            </View>
          </View>
          <AppText variant="bodyMd" color={colors.body}>
            {cat.description}
          </AppText>
          <View style={{ gap: 6 }}>
            <AppText variant="labelSm" color={colors.muted} upper>
              Examples:
            </AppText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {examples.map((e) => (
                <View key={e} style={{ backgroundColor: colors.surfaceLow, borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 }}>
                  <AppText variant="bodySm" color={colors.body}>
                    {e}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 8, backgroundColor: colors.surfaceLow, borderRadius: radius.input, padding: 12 }}>
            <Icon name={cat.tipIcon} size={18} color={colors.primary} />
            <AppText variant="bodySm" color={colors.body} style={{ flex: 1, lineHeight: 18 }}>
              <AppText variant="labelMd" color={colors.heading}>
                {cat.tipLabel}{' '}
              </AppText>
              {cat.tip}
            </AppText>
          </View>
        </Card>
      ))}

      <Card accent style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Icon name="gavel" size={20} color={colors.heading} />
          <AppText variant="headlineSm" color={colors.heading}>
            Civic Penalty Notice
          </AppText>
        </View>
        <AppText variant="bodySm" color={colors.heading} style={{ lineHeight: 18 }}>
          <AppText variant="labelMd" color={colors.heading}>
            Penalties for Mixed Waste:{' '}
          </AppText>
          First Offense carries a ₱500 fine or 8 hours of community environmental service under City Ordinance No. 13378-2018.
        </AppText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Icon name="check-circle" size={16} color={colors.resolvedText} />
          <AppText variant="bodySm" color={colors.heading} style={{ flex: 1 }}>
            Practice segregated collection at source for a cleaner Golden City!
          </AppText>
        </View>
      </Card>
    </ScreenShell>
  );
}
