import AsyncStorage from '@react-native-async-storage/async-storage';

import { BARANGAYS } from '../constants/data';
import type { User } from '../context/AppContext';

export interface Account {
  name: string;
  mobile: string; // 10 digits, e.g. 9175553829
  citizenId: string; // Oro Citizen ID or email (lowercase). Empty string if none.
  pin: string;
  barangay: string;
  demo?: boolean;
}

const ACCOUNTS_KEY = 'orokolekta:accounts';
const LAST_KEY = 'orokolekta:last';

/** Built-in demo account so you can always log in during a presentation. */
export const DEMO_ACCOUNT: Account = {
  name: 'Maria Clara',
  mobile: '9175553829',
  citizenId: 'maria@cdo.gov.ph',
  pin: '123456',
  barangay: 'Carmen',
  demo: true,
};

export function formatMobile(digits: string) {
  return [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 10)].filter(Boolean).join(' ');
}

export function accountToUser(a: Account): User {
  const match = BARANGAYS.find((b) => b.name === a.barangay);
  return {
    name: a.name,
    mobile: `+63 ${formatMobile(a.mobile)}`,
    barangay: a.barangay,
    zone: match ? match.zone : 'Zone 1',
  };
}

export async function loadAccounts(): Promise<Account[]> {
  try {
    const raw = await AsyncStorage.getItem(ACCOUNTS_KEY);
    const stored: Account[] = raw ? JSON.parse(raw) : [];
    return [DEMO_ACCOUNT, ...stored];
  } catch {
    return [DEMO_ACCOUNT];
  }
}

type Result<T> = ({ ok: true } & T) | { ok: false; error: string };

export async function registerAccount(acc: Account): Promise<Result<{}>> {
  const all = await loadAccounts();
  if (all.some((a) => a.mobile === acc.mobile)) {
    return { ok: false, error: 'This mobile number is already registered. Please log in instead.' };
  }
  if (acc.citizenId && all.some((a) => a.citizenId && a.citizenId === acc.citizenId)) {
    return { ok: false, error: 'This Citizen ID / email is already registered. Please log in instead.' };
  }
  try {
    const stored = all.filter((a) => !a.demo);
    await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...stored, acc]));
    return { ok: true };
  } catch {
    return { ok: false, error: 'Could not save your account on this device. Please try again.' };
  }
}

export async function findAccount(mode: 'mobile' | 'citizen', id: string, pin: string): Promise<Result<{ account: Account }>> {
  const all = await loadAccounts();
  const key = id.trim().toLowerCase();
  const account = all.find((a) => (mode === 'mobile' ? a.mobile === key : a.citizenId === key));
  if (!account) {
    return { ok: false, error: 'No account found. Tap "Register your Household" below to create one.' };
  }
  if (account.pin !== pin) {
    return { ok: false, error: 'Incorrect MPIN / password. Please try again.' };
  }
  return { ok: true, account };
}

export async function setLastAccount(mobile: string) {
  try {
    await AsyncStorage.setItem(LAST_KEY, mobile);
  } catch {}
}

export async function getLastAccount(): Promise<Account | null> {
  try {
    const mobile = await AsyncStorage.getItem(LAST_KEY);
    if (!mobile) return null;
    const all = await loadAccounts();
    return all.find((a) => a.mobile === mobile) ?? null;
  } catch {
    return null;
  }
}
