import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Platform, Pressable, TextInput, View } from 'react-native';

import { AppText } from '../../components/AppText';
import { Card } from '../../components/Card';
import { Icon } from '../../components/Icon';
import { MapPreview } from '../../components/MapPreview';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenShell } from '../../components/ScreenShell';
import { REPORT_CATEGORIES } from '../../constants/data';
import { colors, fonts, radius } from '../../constants/theme';
import { ReportType, useApp } from '../../context/AppContext';

const MAX_PHOTOS = 3;
const MAX_NOTES = 300;

type Gps =
  | { status: 'loading' }
  | { status: 'denied' }
  | { status: 'error' }
  | { status: 'ok'; lat: number; lon: number; accuracy: number | null; address: string };

async function lookupAddress(lat: number, lon: number): Promise<string | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 6000);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&lat=${lat}&lon=${lon}`,
      { signal: ctrl.signal, headers: { 'Accept-Language': 'en' } },
    );
    clearTimeout(t);
    if (!res.ok) return null;
    const data = await res.json();
    const a = data.address ?? {};
    const parts = [a.road, a.suburb ?? a.neighbourhood ?? a.village ?? a.quarter, a.city ?? a.town ?? a.county].filter(Boolean);
    return parts.length ? parts.join(', ') : (data.display_name ?? null);
  } catch {
    return null;
  }
}

export default function ReportScreen() {
  const { state, actions } = useApp();
  const [type, setType] = useState<ReportType>('missed');
  const [categoryId, setCategoryId] = useState<string>(REPORT_CATEGORIES.missed[0].id);
  const [open, setOpen] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [sms, setSms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const [gps, setGps] = useState<Gps>({ status: 'loading' });

  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    locate();
    return () => {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function locate() {
    setGps({ status: 'loading' });
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        if (mounted.current) setGps({ status: 'denied' });
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude, accuracy } = pos.coords;
      const fallback = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      if (mounted.current) setGps({ status: 'ok', lat: latitude, lon: longitude, accuracy: accuracy ?? null, address: fallback });
      const address = await lookupAddress(latitude, longitude);
      if (address && mounted.current) {
        setGps({ status: 'ok', lat: latitude, lon: longitude, accuracy: accuracy ?? null, address });
      }
    } catch {
      if (mounted.current) setGps({ status: 'error' });
    }
  }

  const categories = REPORT_CATEGORIES[type];
  const category = categories.find((c) => c.id === categoryId) ?? categories[0];

  const switchType = (next: ReportType) => {
    setType(next);
    setCategoryId(REPORT_CATEGORIES[next][0].id);
    setOpen(false);
    setError(null);
  };

  const addUris = (uris: string[]) => {
    setPhotos((p) => [...p, ...uris].slice(0, MAX_PHOTOS));
    setError(null);
  };

  const pickFromGallery = async () => {
    const left = MAX_PHOTOS - photos.length;
    if (left <= 0) return;
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: left > 1,
        selectionLimit: left,
        quality: 0.7,
      });
      if (!res.canceled) addUris(res.assets.map((a) => a.uri));
    } catch {
      setError('Could not open your photo library.');
    }
  };

  const takePhoto = async () => {
    if (photos.length >= MAX_PHOTOS) return;
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        setError('Camera permission is needed to take a photo. Allow it in your phone settings.');
        return;
      }
      const res = await ImagePicker.launchCameraAsync({ quality: 0.7 });
      if (!res.canceled) addUris(res.assets.map((a) => a.uri));
    } catch {
      setError('Could not open the camera.');
    }
  };

  const locationText =
    gps.status === 'ok' ? gps.address : `Brgy. ${state.user.barangay} (GPS location not shared)`;

  const submit = () => {
    if (photos.length === 0) {
      setError('Please attach at least one photo as evidence.');
      return;
    }
    const report = actions.addReport({
      type,
      category: category.label,
      notes: notes.trim(),
      location: locationText,
      photos: photos.length,
    });
    setSubmitted(report.id);
    setPhotos([]);
    setNotes('');
    setError(null);
  };

  if (submitted) {
    return (
      <ScreenShell>
        <Card style={{ alignItems: 'center', gap: 12, paddingVertical: 32 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: colors.resolvedBg,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Icon name="check-circle" size={36} color={colors.resolvedText} />
          </View>
          <AppText variant="headlineLg" color={colors.heading}>
            Report Submitted
          </AppText>
          <AppText variant="bodyMd" color={colors.muted} style={{ textAlign: 'center' }}>
            Reference no. <AppText variant="labelLg" color={colors.body}>{submitted}</AppText>
            {'\n'}Your Barangay Solid Waste Committee will review it within 24 hours. You can track it in Profile → My Past Reports.
          </AppText>
          <PrimaryButton
            label="Submit Another Report"
            icon="add"
            style={{ alignSelf: 'stretch', marginTop: 8 }}
            onPress={() => setSubmitted(null)}
          />
        </Card>
      </ScreenShell>
    );
  }

  const tileStyle = {
    width: 104,
    height: 104,
    borderRadius: radius.input,
    borderWidth: 1.5,
    borderStyle: 'dashed' as const,
    borderColor: colors.primary,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 4,
  };

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
            Official CLENRO Action Desk
          </AppText>
        </View>
        <AppText variant="display" color={colors.heading}>
          Submit Waste Report
        </AppText>
        <AppText variant="bodyMd" color={colors.muted}>
          Report uncollected trash or illegal dumping directly to CLENRO Cagayan de Oro.
        </AppText>
      </View>

      {/* Incident type */}
      <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceContainer, borderRadius: radius.input, padding: 4 }}>
        {(
          [
            { key: 'missed', label: 'Missed Pickup', icon: 'event-busy' },
            { key: 'illegal', label: 'Illegal Dumping', icon: 'delete-forever' },
          ] as const
        ).map((t) => {
          const active = type === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => switchType(t.key)}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 9,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                backgroundColor: active ? colors.primary : 'transparent',
              }}>
              <Icon name={t.icon} size={18} color={active ? colors.white : colors.muted} />
              <AppText variant="labelMd" color={active ? colors.white : colors.muted}>
                {t.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {/* Category */}
      <View style={{ gap: 6 }}>
        <AppText variant="labelMd" color={colors.heading}>
          Issue Category <AppText variant="labelMd" color={colors.criticalText}>*</AppText>
        </AppText>
        <Pressable
          onPress={() => setOpen((o) => !o)}
          style={{
            minHeight: 48,
            borderRadius: radius.input,
            borderWidth: 1.5,
            borderColor: open ? colors.primary : colors.border,
            backgroundColor: colors.white,
            paddingHorizontal: 16,
            paddingVertical: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}>
          <AppText variant="bodyMd" style={{ flex: 1 }}>
            {category.label}
          </AppText>
          <Icon name={open ? 'expand-less' : 'expand-more'} size={22} color={colors.muted} />
        </Pressable>
        {open ? (
          <View style={{ borderRadius: radius.input, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.white, overflow: 'hidden' }}>
            {categories.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => {
                  setCategoryId(c.id);
                  setOpen(false);
                }}
                style={{
                  padding: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: c.id === category.id ? colors.surfaceLow : colors.white,
                }}>
                <AppText variant="bodyMd" style={{ flex: 1 }}>
                  {c.label}
                </AppText>
                {c.id === category.id ? <Icon name="check" size={18} color={colors.primary} /> : null}
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>

      {/* Photos (real picker) */}
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <AppText variant="labelMd" color={colors.heading}>
            Incident Photos <AppText variant="labelMd" color={colors.criticalText}>*</AppText>
          </AppText>
          <AppText variant="bodySm" color={colors.muted}>
            {photos.length} of {MAX_PHOTOS} uploaded
          </AppText>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {photos.map((uri) => (
            <View key={uri} style={{ width: 104, height: 104, borderRadius: radius.input, overflow: 'hidden', backgroundColor: colors.tint }}>
              <Image source={{ uri }} style={{ width: 104, height: 104 }} contentFit="cover" />
              <Pressable
                accessibilityLabel="Remove photo"
                onPress={() => setPhotos((p) => p.filter((x) => x !== uri))}
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: colors.heading,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Icon name="close" size={14} color={colors.white} />
              </Pressable>
            </View>
          ))}
          {photos.length < MAX_PHOTOS ? (
            <Pressable onPress={pickFromGallery} style={tileStyle}>
              <Icon name="add-photo-alternate" size={26} color={colors.primary} />
              <AppText variant="labelSm" color={colors.primary}>
                {Platform.OS === 'web' ? 'Upload Photo' : 'Gallery'}
              </AppText>
            </Pressable>
          ) : null}
          {photos.length < MAX_PHOTOS && Platform.OS !== 'web' ? (
            <Pressable onPress={takePhoto} style={tileStyle}>
              <Icon name="add-a-photo" size={26} color={colors.primary} />
              <AppText variant="labelSm" color={colors.primary}>
                Take Photo
              </AppText>
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Location (real GPS) */}
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <AppText variant="labelMd" color={colors.heading}>
            Incident Location <AppText variant="labelMd" color={colors.criticalText}>*</AppText>
          </AppText>
          <Pressable onPress={locate} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <Icon name="my-location" size={16} color={colors.primary} />
            <AppText variant="labelMd" color={colors.primary}>
              Refresh GPS
            </AppText>
          </Pressable>
        </View>
        <Card flat style={{ padding: 0, overflow: 'hidden', borderWidth: 1.5, borderColor: colors.border }}>
          {gps.status === 'ok' ? (
            <MapPreview lat={gps.lat} lon={gps.lon} />
          ) : (
            <View style={{ height: 120, backgroundColor: colors.tint, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 16 }}>
              {gps.status === 'loading' ? <ActivityIndicator color={colors.primary} /> : <Icon name="location-off" size={30} color={colors.heading} />}
              <AppText variant="bodySm" color={colors.heading} style={{ textAlign: 'center' }}>
                {gps.status === 'loading'
                  ? 'Getting your GPS location…'
                  : gps.status === 'denied'
                    ? 'Location permission was denied. Allow location access (browser or phone settings), then tap Refresh GPS.'
                    : 'Could not get your location. Turn on GPS / location services, then tap Refresh GPS.'}
              </AppText>
            </View>
          )}
          <View style={{ padding: 12, flexDirection: 'row', gap: 8, backgroundColor: colors.white }}>
            <Icon name={gps.status === 'ok' ? 'check-circle' : 'info'} size={18} color={gps.status === 'ok' ? colors.resolvedText : colors.muted} />
            <View style={{ flex: 1 }}>
              {gps.status === 'ok' ? (
                <>
                  <AppText variant="labelSm" color={colors.resolvedText} upper>
                    GPS Tag Confirmed{gps.accuracy != null ? ` • ±${Math.round(gps.accuracy)}m` : ''}
                  </AppText>
                  <AppText variant="labelMd" color={colors.body}>
                    {gps.address}
                  </AppText>
                  <AppText variant="bodySm" color={colors.muted}>
                    {gps.lat.toFixed(5)}, {gps.lon.toFixed(5)} • Brgy. {state.user.barangay}, {state.user.zone}
                  </AppText>
                  <Pressable
                    onPress={() => Linking.openURL(`https://www.openstreetmap.org/?mlat=${gps.lat}&mlon=${gps.lon}#map=18/${gps.lat}/${gps.lon}`)}
                    style={{ marginTop: 6 }}>
                    <AppText variant="labelMd" color={colors.primary}>
                      Open in Maps →
                    </AppText>
                  </Pressable>
                </>
              ) : (
                <AppText variant="bodySm" color={colors.muted}>
                  Waiting for GPS. You can still submit; the report will use Brgy. {state.user.barangay} as the location.
                </AppText>
              )}
            </View>
          </View>
        </Card>
      </View>

      {/* Notes */}
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <AppText variant="labelMd" color={colors.heading}>
            Additional Details <AppText variant="labelMd" color={colors.muted}>(Optional)</AppText>
          </AppText>
          <AppText variant="bodySm" color={colors.muted}>
            {notes.length} / {MAX_NOTES}
          </AppText>
        </View>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          multiline
          maxLength={MAX_NOTES}
          placeholder="Describe the situation, landmarks, or estimated volume of uncollected waste..."
          placeholderTextColor={colors.muted}
          textAlignVertical="top"
          style={{
            minHeight: 96,
            borderRadius: radius.input,
            borderWidth: 1.5,
            borderColor: focused ? colors.primary : colors.border,
            backgroundColor: colors.white,
            padding: 14,
            fontFamily: fonts.regular,
            fontSize: 14,
            color: colors.body,
          }}
        />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Icon name="lightbulb" size={14} color={colors.muted} />
            <AppText variant="bodySm" color={colors.muted}>
              Tip: Mention nearby landmarks
            </AppText>
          </View>
          <Pressable onPress={() => setNotes('')}>
            <AppText variant="labelMd" color={colors.primary}>
              Clear
            </AppText>
          </Pressable>
        </View>
      </View>

      {/* Advisory */}
      <Card accent style={{ flexDirection: 'row', gap: 10 }}>
        <Icon name="info" size={20} color={colors.heading} />
        <View style={{ flex: 1 }}>
          <AppText variant="labelMd" color={colors.heading}>
            {state.user.barangay} Waste Schedule Note
          </AppText>
          <AppText variant="bodySm" color={colors.heading} style={{ marginTop: 2 }}>
            Biodegradable collection is Mon / Wed / Fri (7:00 AM). Residual waste is collected on Thursdays at 6:30 AM.
          </AppText>
        </View>
      </Card>

      {/* SMS consent */}
      <Pressable onPress={() => setSms((s) => !s)} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 6,
            borderWidth: 1.5,
            borderColor: sms ? colors.primary : colors.border,
            backgroundColor: sms ? colors.primary : colors.white,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 2,
          }}>
          {sms ? <Icon name="check" size={14} color={colors.white} /> : null}
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="labelMd" color={colors.body}>
            Allow CLENRO field officers to contact me via SMS
          </AppText>
          <AppText variant="bodySm" color={colors.muted}>
            Used strictly for location clarification and verification photos. We keep citizen numbers confidential.
          </AppText>
        </View>
      </Pressable>

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

      <PrimaryButton label="Submit Report to CLENRO" icon="send" onPress={submit} />
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
        <Icon name="schedule" size={14} color={colors.muted} />
        <AppText variant="bodySm" color={colors.muted}>
          Reports are reviewed within 24 hours by your Barangay Solid Waste Committee.
        </AppText>
      </View>
    </ScreenShell>
  );
}
