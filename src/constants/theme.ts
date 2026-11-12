// OroKolekta design tokens (from the Stitch "Civic Waste Platform" design system)
export const colors = {
  canvas: '#FFF8F8',
  surface: '#FFFFFF',
  surfaceLow: '#FFF0F2',
  surfaceContainer: '#FFE8EC',
  tint: '#FFDADA',
  tintSoft: '#F7D6D0',
  primary: '#C96679',
  primaryPressed: '#B55567',
  heading: '#7A3040',
  body: '#4A2530',
  muted: '#8C6470',
  border: '#ECD3D8',
  white: '#FFFFFF',

  pendingText: '#C96679',
  pendingBg: '#FCE8EC',
  pendingBorder: '#F7CAD3',
  reviewText: '#D97706',
  reviewBg: '#FEF3C7',
  reviewBorder: '#FDE68A',
  resolvedText: '#059669',
  resolvedBg: '#D1FAE5',
  resolvedBorder: '#A7F3D0',
  criticalText: '#B91C1C',
  criticalBg: '#FEE2E2',
  criticalBorder: '#FECACA',

  bio: '#15803D',
  residual: '#B45309',
  recycle: '#2563EB',
} as const;

export const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
} as const;

export const radius = { card: 14, input: 12, nav: 16, pill: 9999 } as const;

export const cardShadow =
  '0px 4px 16px -2px rgba(122, 48, 64, 0.05), 0px 1px 3px 0px rgba(122, 48, 64, 0.03)';
