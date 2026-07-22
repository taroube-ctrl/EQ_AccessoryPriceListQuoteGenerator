import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { LocalAccount } from '../types/localAccount';
import { getLocalAccountDisplayName } from '../types/localAccount';
import {
  LOCAL_ACCOUNTS_EVENT,
  createLocalAccount,
  deleteLocalAccount,
  getActiveLocalAccount,
  loadLocalAccounts,
  signInLocalAccount,
  signOutLocalAccount,
} from '../utils/localAccounts';

interface LocalAccountContextValue {
  account: LocalAccount | null;
  accounts: LocalAccount[];
  displayName: string | null;
  createAccount: (firstName: string, lastName: string) => LocalAccount;
  signIn: (firstName: string, lastName: string) => LocalAccount;
  signOut: () => void;
  removeAccount: (id: string) => void;
}

const LocalAccountContext = createContext<LocalAccountContextValue | null>(null);

export function LocalAccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<LocalAccount | null>(() => getActiveLocalAccount());
  const [accounts, setAccounts] = useState<LocalAccount[]>(() => loadLocalAccounts());

  const refresh = useCallback(() => {
    setAccount(getActiveLocalAccount());
    setAccounts(loadLocalAccounts());
  }, []);

  useEffect(() => {
    window.addEventListener(LOCAL_ACCOUNTS_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(LOCAL_ACCOUNTS_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [refresh]);

  const value = useMemo<LocalAccountContextValue>(
    () => ({
      account,
      accounts,
      displayName: account ? getLocalAccountDisplayName(account) : null,
      createAccount: (firstName, lastName) => {
        const created = createLocalAccount(firstName, lastName);
        refresh();
        return created;
      },
      signIn: (firstName, lastName) => {
        const signedIn = signInLocalAccount(firstName, lastName);
        refresh();
        return signedIn;
      },
      signOut: () => {
        signOutLocalAccount();
        refresh();
      },
      removeAccount: (id) => {
        deleteLocalAccount(id);
        refresh();
      },
    }),
    [account, accounts, refresh],
  );

  return (
    <LocalAccountContext.Provider value={value}>{children}</LocalAccountContext.Provider>
  );
}

export function useLocalAccount() {
  const ctx = useContext(LocalAccountContext);
  if (!ctx) throw new Error('useLocalAccount must be used within LocalAccountProvider');
  return ctx;
}
