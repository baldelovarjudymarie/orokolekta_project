import React from 'react';
import { View } from 'react-native';

import type { ReportStatus } from '../context/AppContext';
import { colors, radius } from '../constants/theme';
import { AppText } from './AppText';

const MAP: Record<ReportStatus, { label: string; text: string; bg: string; border: string }> = {
  submitted: { label: 'Submitted', text: colors.pendingText, bg: colors.pendingBg, border: colors.pendingBorder },
  in_review: { label: 'In Review', text: colors.reviewText, bg: colors.reviewBg, border: colors.reviewBorder },
  resolved: { label: 'Resolved', text: colors.resolvedText, bg: colors.resolvedBg, border: colors.resolvedBorder },
};

export function StatusChip({ status }: { status: ReportStatus }) {
  const s = MAP[status];
  return (
    <View
      style={{
        height: 28,
        paddingHorizontal: 12,
        borderRadius: radius.pill,
        backgroundColor: s.bg,
        borderWidth: 1,
        borderColor: s.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <AppText variant="labelSm" color={s.text} upper>
        {s.label}
      </AppText>
    </View>
  );
}
