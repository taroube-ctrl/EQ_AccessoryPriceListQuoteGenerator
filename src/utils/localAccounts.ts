import type { LocalAccount } from '../types/localAccount';

const ACCOUNTS_KEY = 'local-accounts-v1';
const ACTIVE_ID_KEY = 'local-account-active-id-v1';

export const LOCAL_ACCOUNTS_EVENT = 'local-accounts-changed';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function createId(): string {
  return `account-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function notify(): void {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(LOCAL_ACCOUNTS_EVENT));
}

export function loadLocalAccounts(): LocalAccount[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LocalAccount[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistAccounts(accounts: LocalAccount[]): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  notify();
}

export function getActiveLocalAccountId(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(ACTIVE_ID_KEY);
}

export function setActiveLocalAccountId(id: string | null): void {
  if (!isBrowser()) return;
  if (id) {
    window.localStorage.setItem(ACTIVE_ID_KEY, id);
  } else {
    window.localStorage.removeItem(ACTIVE_ID_KEY);
  }
  notify();
}

export function getActiveLocalAccount(): LocalAccount | null {
  const id = getActiveLocalAccountId();
  if (!id) return null;
  return loadLocalAccounts().find((account) => account.id === id) ?? null;
}

export function findLocalAccountByName(
  firstName: string,
  lastName: string,
): LocalAccount | null {
  const first = normalizeName(firstName);
  const last = normalizeName(lastName);
  if (!first || !last) return null;

  return (
    loadLocalAccounts().find(
      (account) =>
        normalizeName(account.firstName) === first &&
        normalizeName(account.lastName) === last,
    ) ?? null
  );
}

export function createLocalAccount(firstName: string, lastName: string): LocalAccount {
  const trimmedFirst = firstName.trim().replace(/\s+/g, ' ');
  const trimmedLast = lastName.trim().replace(/\s+/g, ' ');
  if (!trimmedFirst || !trimmedLast) {
    throw new Error('First and last name are required.');
  }

  const existing = findLocalAccountByName(trimmedFirst, trimmedLast);
  if (existing) {
    setActiveLocalAccountId(existing.id);
    return existing;
  }

  const account: LocalAccount = {
    id: createId(),
    firstName: trimmedFirst,
    lastName: trimmedLast,
    createdAt: new Date().toISOString(),
  };

  persistAccounts([account, ...loadLocalAccounts()]);
  setActiveLocalAccountId(account.id);
  return account;
}

export function signInLocalAccount(firstName: string, lastName: string): LocalAccount {
  const match = findLocalAccountByName(firstName, lastName);
  if (!match) {
    throw new Error('No account found with that name on this device. Create an account first.');
  }
  setActiveLocalAccountId(match.id);
  return match;
}

export function signOutLocalAccount(): void {
  setActiveLocalAccountId(null);
}

export function deleteLocalAccount(id: string): void {
  const remaining = loadLocalAccounts().filter((account) => account.id !== id);
  persistAccounts(remaining);
  if (getActiveLocalAccountId() === id) {
    setActiveLocalAccountId(null);
  }
}
