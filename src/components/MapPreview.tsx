import { Image } from 'expo-image';
import React, { useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';

import { colors } from '../constants/theme';
import { AppText } from './AppText';
import { Icon } from './Icon';

const Z = 17; // zoom level
const TILE = 256;

function worldTile(lat: number, lon: number) {
  const n = 2 ** Z;
  const x = ((lon + 180) / 360) * n;
  const rad = (lat * Math.PI) / 180;
  const y = ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n;
  return { x, y, n };
}

/** Real OpenStreetMap preview centred on the given GPS position (no extra package needed). */
export function MapPreview({ lat, lon, height = 160 }: { lat: number; lon: number; height?: number }) {
  const [width, setWidth] = useState(0);
  const { x, y, n } = worldTile(lat, lon);
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  const fx = x - tx;
  const fy = y - ty;
  const rx = Math.min(6, Math.ceil(width / 2 / TILE) + 1);
  const ry = Math.ceil(height / 2 / TILE) + 1;

  const tiles: React.ReactNode[] = [];
  if (width > 0) {
    for (let dy = -ry; dy <= ry; dy++) {
      for (let dx = -rx; dx <= rx; dx++) {
        const tileX = (((tx + dx) % n) + n) % n;
        const tileY = ty + dy;
        if (tileY < 0 || tileY >= n) continue;
        tiles.push(
          <Image
            key={`${dx},${dy}`}
            source={{ uri: `https://tile.openstreetmap.org/${Z}/${tileX}/${tileY}.png` }}
            style={{
              position: 'absolute',
              width: TILE,
              height: TILE,
              left: width / 2 - fx * TILE + dx * TILE,
              top: height / 2 - fy * TILE + dy * TILE,
            }}
          />,
        );
      }
    }
  }

  return (
    <View
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      style={{ height, overflow: 'hidden', backgroundColor: colors.tint }}>
      {tiles}
      <View style={{ position: 'absolute', left: width / 2 - 20, top: height / 2 - 38 }}>
        <Icon name="location-on" size={40} color={colors.primary} />
      </View>
      <View style={{ position: 'absolute', right: 6, bottom: 4, backgroundColor: 'rgba(255,255,255,0.8)', paddingHorizontal: 4, borderRadius: 4 }}>
        <AppText variant="bodySm" color={colors.body} style={{ fontSize: 9, lineHeight: 12 }}>
          © OpenStreetMap contributors
        </AppText>
      </View>
    </View>
  );
}
