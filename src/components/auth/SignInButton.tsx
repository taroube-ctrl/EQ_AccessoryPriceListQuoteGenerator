import { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import {
  getAuthErrorMessage,
  isAzureClientConfigured,
  loginMicrosoft,
  logoutMicrosoft,
} from '../../auth/microsoftAuth';

type SignInButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function SignInButton({ children, onClick, ...props }: SignInButtonProps) {
  const { instance, accounts } = useMsal();
  const account = accounts[0];
  const [error, setError] = useState<string | null>(null);

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    setError(null);

    try {
      if (account) {
        await logoutMicrosoft(instance);
        return;
      }
      await loginMicrosoft(instance);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    }
  };

  return (
    <div className="contents">
      <button
        type="button"
        {...props}
        onClick={handleClick}
        title={error ?? (account ? 'Sign out of Microsoft' : 'Sign in with Microsoft')}
      >
        {children}
      </button>
      {error && (
        <span className="sr-only" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

export function useMicrosoftAccount() {
  const { accounts } = useMsal();
  return accounts[0] ?? null;
}

export function MicrosoftSignInPanel({ className = '' }: { className?: string }) {
  const { instance, accounts } = useMsal();
  const account = accounts[0];
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const configured = isAzureClientConfigured();

  const handleAuth = async () => {
    setError(null);
    setBusy(true);
    try {
      if (account) {
        await logoutMicrosoft(instance);
      } else {
        await loginMicrosoft(instance);
      }
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={className}>
      {!configured && (
        <div className="mb-3 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          Microsoft sign-in needs a real Azure client ID in <code>.env</code> (
          <code>VITE_AZURE_CLIENT_ID</code>). Register a Single-page app in Azure Portal with
          redirect URI <code>http://localhost:5173</code>, then restart the dev server.
        </div>
      )}

      {account ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-gray-700">
            Signed in as <strong>{account.name ?? account.username}</strong>
          </span>
          <button
            type="button"
            onClick={handleAuth}
            disabled={busy}
            className="rounded-sm border border-gray-300 bg-white px-3 py-1.5 text-sm cursor-pointer hover:bg-gray-50 disabled:opacity-60"
          >
            {busy ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleAuth}
          disabled={busy || !configured}
          className="inline-flex items-center gap-2 rounded-sm bg-[#2f2f2f] px-4 py-2 text-sm font-semibold text-white border-none cursor-pointer hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <MicrosoftLogoMark />
          {busy ? 'Signing in…' : 'Sign in with Microsoft'}
        </button>
      )}

      {error && (
        <p className="mt-3 mb-0 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function MicrosoftLogoMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 21 21" aria-hidden>
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  );
}
