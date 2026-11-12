import { colors } from './theme';

export type WasteKind = 'bio' | 'recycle' | 'residual' | 'none';

export const WASTE_META: Record<WasteKind, { label: string; short: string; color: string }> = {
  bio: { label: 'Biodegradable', short: 'Bio', color: colors.bio },
  recycle: { label: 'Recyclable', short: 'Recycle', color: colors.recycle },
  residual: { label: 'Residual', short: 'Residual', color: colors.residual },
  none: { label: 'No collection', short: 'None', color: colors.muted },
};

// index = Date.getDay() (0 = Sunday). Matches the schedule in the Segregation Guide.
export const WEEKLY_SCHEDULE: WasteKind[] = [
  'none', // Sun
  'bio', // Mon
  'recycle', // Tue
  'bio', // Wed
  'residual', // Thu
  'bio', // Fri
  'recycle', // Sat
];

export const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export const BARANGAYS = [
  { name: 'Carmen', zone: 'Zone 4' },
  { name: 'Kauswagan', zone: 'Zone 2' },
  { name: 'Lapasan', zone: 'Zone 1' },
  { name: 'Bulua', zone: 'Zone 3' },
  { name: 'Macasandig', zone: 'Zone 5' },
];

export const REPORT_CATEGORIES = {
  missed: [
    { id: 'no-truck', label: 'No Garbage Truck Arrived (Scheduled Day)' },
    { id: 'overflowing', label: 'Overflowing Public Bin' },
  ],
  illegal: [
    { id: 'vacant-lot', label: 'Illegal Dumping in Vacant Lot' },
    { id: 'scattered', label: 'Scattered Waste on Roadside / Canal' },
    { id: 'commercial', label: 'Unsegregated Commercial Waste' },
  ],
} as const;

export interface GuideCategory {
  id: 'bio' | 'recycle' | 'residual';
  title: string;
  local: string;
  schedule: string;
  icon: string;
  color: string;
  description: string;
  examples: string[];
  tipIcon: string;
  tip: string;
  tipLabel: string;
}

export const GUIDE: GuideCategory[] = [
  {
    id: 'bio',
    title: 'Biodegradable',
    local: 'Maladut',
    schedule: 'Mon, Wed, Fri',
    icon: 'eco',
    color: colors.bio,
    description:
      'Organic waste that naturally decomposes into high-nutrient compost and natural soil conditioner for local barangay urban gardens.',
    examples: [
      'Food scraps & fruit peels',
      'Fish & meat bones',
      'Fallen leaves & clippings',
      'Leftover rice / kakanin',
      'Soiled paper napkins',
    ],
    tipIcon: 'tips-and-updates',
    tipLabel: 'Proper storage:',
    tip: 'Store in covered bins or biodegradable bags to prevent pests and leachate runoff before 6:00 AM pickup.',
  },
  {
    id: 'recycle',
    title: 'Recyclable',
    local: 'Mabaligya / Mapuslan',
    schedule: 'Tues & Sat',
    icon: 'autorenew',
    color: colors.recycle,
    description:
      'Clean, dry materials processed through local Barangay Materials Recovery Facilities (MRFs) or accredited CDO junk buyback shops.',
    examples: [
      'PET plastic bottles',
      'Cardboard boxes & paper',
      'Clean tin cans & scrap',
      'Glass bottles & jars',
      'Beverage cartons (washed)',
    ],
    tipIcon: 'cleaning-services',
    tipLabel: 'Proper storage:',
    tip: 'Rinse clean and flatten bottles/boxes before setting out to prevent odors and maximize truck capacity.',
  },
  {
    id: 'residual',
    title: 'Residual & Special',
    local: 'Dili Maladut',
    schedule: 'Thursdays Only',
    icon: 'delete-forever',
    color: colors.residual,
    description:
      'Non-recyclable domestic discards and hazardous items transported strictly to the engineered sanitary facility or chemical disposal center.',
    examples: [
      'Sachets & wrappers',
      'Diapers & napkins',
      'Styrofoam packaging',
      'Worn out shoes/slippers',
      'Batteries & e-waste',
    ],
    tipIcon: 'warning',
    tipLabel: 'Proper storage:',
    tip: 'Must be tied securely. Household hazardous chemicals or medical waste must be labeled clearly in separate containers.',
  },
];
