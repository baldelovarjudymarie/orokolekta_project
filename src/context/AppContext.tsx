import React, { createContext, useContext, useMemo, useReducer } from 'react';

import { BARANGAYS } from '../constants/data';

/* ----------------------------- Types ----------------------------- */

export type TruckStatus = 'arriving' | 'delayed';
export type ReportType = 'missed' | 'illegal';
export type ReportStatus = 'submitted' | 'in_review' | 'resolved';
export type Language = 'en' | 'bis';

export interface Report {
  id: string;
  type: ReportType;
  category: string;
  notes: string;
  location: string;
  photos: number;
  status: ReportStatus;
  createdAt: string; // ISO string
}

export interface User {
  name: string;
  mobile: string;
  barangay: string;
  zone: string;
}

export interface AppState {
  isAuthenticated: boolean;
  user: User;
  truckStatus: TruckStatus;
  reports: Report[];
  language: Language;
  notificationsEnabled: boolean;
  unreadNotifications: number;
  pickupsTracked: number;
  complianceScore: number;
}

/* ----------------------------- Actions ----------------------------- */

type Action =
  | { type: 'LOGIN'; user: User; demo: boolean }
  | { type: 'LOGOUT' }
  | { type: 'TOGGLE_TRUCK_ADVISORY' }
  | { type: 'ADD_REPORT'; report: Report }
  | { type: 'SET_LANGUAGE'; language: Language }
  | { type: 'TOGGLE_NOTIFICATIONS' }
  | { type: 'MARK_NOTIFICATIONS_READ' }
  | { type: 'SET_BARANGAY'; barangay: string; zone: string };

/* ----------------------------- Initial state ----------------------------- */

const seedReports: Report[] = [
  {
    id: 'ORK-204815',
    type: 'missed',
    category: 'No Garbage Truck Arrived (Scheduled Day)',
    notes: 'No truck on Monday morning.',
    location: 'Vamenta Blvd cor. Seriña St, Brgy Carmen',
    photos: 1,
    status: 'resolved',
    createdAt: '2026-10-26T07:30:00.000Z',
  },
  {
    id: 'ORK-317702',
    type: 'illegal',
    category: 'Scattered Waste on Roadside / Canal',
    notes: 'Bags scattered near the canal.',
    location: 'Canal side, Brgy Carmen',
    photos: 2,
    status: 'in_review',
    createdAt: '2026-11-05T09:10:00.000Z',
  },
  {
    id: 'ORK-452190',
    type: 'missed',
    category: 'Overflowing Public Bin',
    notes: 'Public bin overflowing near the basketball court.',
    location: 'Basketball court, Brgy Carmen',
    photos: 1,
    status: 'submitted',
    createdAt: '2026-11-10T14:45:00.000Z',
  },
];

export const initialState: AppState = {
  isAuthenticated: false,
  user: {
    name: 'Maria Clara',
    mobile: '+63 917 555 3829',
    barangay: 'Carmen',
    zone: 'Zone 4',
  },
  truckStatus: 'arriving',
  reports: seedReports,
  language: 'en',
  notificationsEnabled: true,
  unreadNotifications: 2,
  pickupsTracked: 14,
  complianceScore: 88,
};

/* ----------------------------- Reducer ----------------------------- */

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN':
      // Demo account gets sample data; every real account starts clean.
      return {
        ...state,
        isAuthenticated: true,
        user: action.user,
        truckStatus: 'arriving',
        reports: action.demo ? seedReports : [],
        pickupsTracked: action.demo ? 14 : 0,
        complianceScore: action.demo ? 88 : 100,
        unreadNotifications: action.demo ? 2 : 1,
      };
    case 'LOGOUT':
      return { ...initialState, language: state.language };
    case 'TOGGLE_TRUCK_ADVISORY':
      return { ...state, truckStatus: state.truckStatus === 'arriving' ? 'delayed' : 'arriving' };
    case 'ADD_REPORT':
      return { ...state, reports: [action.report, ...state.reports] };
    case 'SET_LANGUAGE':
      return { ...state, language: action.language };
    case 'TOGGLE_NOTIFICATIONS':
      return { ...state, notificationsEnabled: !state.notificationsEnabled };
    case 'MARK_NOTIFICATIONS_READ':
      return { ...state, unreadNotifications: 0 };
    case 'SET_BARANGAY':
      return { ...state, user: { ...state.user, barangay: action.barangay, zone: action.zone } };
    default:
      return state;
  }
}

/* ----------------------------- Context ----------------------------- */

interface Actions {
  login: (user: User, demo?: boolean) => void;
  logout: () => void;
  toggleTruckAdvisory: () => void;
  addReport: (input: Omit<Report, 'id' | 'status' | 'createdAt'>) => Report;
  setLanguage: (language: Language) => void;
  toggleNotifications: () => void;
  markNotificationsRead: () => void;
  setBarangay: (barangay: string) => void;
}

interface AppContextValue {
  state: AppState;
  actions: Actions;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const actions = useMemo<Actions>(
    () => ({
      login: (user, demo = false) => dispatch({ type: 'LOGIN', user, demo }),
      logout: () => dispatch({ type: 'LOGOUT' }),
      toggleTruckAdvisory: () => dispatch({ type: 'TOGGLE_TRUCK_ADVISORY' }),
      addReport: (input) => {
        // Ids/timestamps are created here (an event handler), not inside the reducer, so the reducer stays pure.
        const report: Report = {
          ...input,
          id: `ORK-${Date.now().toString().slice(-6)}`,
          status: 'submitted',
          createdAt: new Date().toISOString(),
        };
        dispatch({ type: 'ADD_REPORT', report });
        return report;
      },
      setLanguage: (language) => dispatch({ type: 'SET_LANGUAGE', language }),
      toggleNotifications: () => dispatch({ type: 'TOGGLE_NOTIFICATIONS' }),
      markNotificationsRead: () => dispatch({ type: 'MARK_NOTIFICATIONS_READ' }),
      setBarangay: (barangay) => {
        const match = BARANGAYS.find((b) => b.name === barangay);
        dispatch({ type: 'SET_BARANGAY', barangay, zone: match ? match.zone : 'Zone 1' });
      },
    }),
    [],
  );

  const value = useMemo(() => ({ state, actions }), [state, actions]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used inside <AppProvider>');
  }
  return ctx;
}
