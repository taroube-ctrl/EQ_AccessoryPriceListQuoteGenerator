import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useLocalAccount } from '../context/LocalAccountContext';
import { getLocalAccountDisplayName } from '../types/localAccount';

type AccountMode = 'create' | 'signin';

export function AccountPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { account, accounts, createAccount, signIn, signOut, removeAccount } = useLocalAccount();

  const mode: AccountMode = searchParams.get('mode') === 'signin' ? 'signin' : 'create';
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const title = mode === 'create' ? 'Create account' : 'Sign in';
  const subtitle =
    mode === 'create'
      ? 'Enter your first and last name to create an account on this device. No password is required.'
      : 'Sign in with the first and last name you used when creating your account on this device.';

  const sortedAccounts = useMemo(
    () =>
      [...accounts].sort((a, b) =>
        getLocalAccountDisplayName(a).localeCompare(getLocalAccountDisplayName(b)),
      ),
    [accounts],
  );

  const setMode = (next: AccountMode) => {
    setError(null);
    setSuccess(null);
    setSearchParams(next === 'signin' ? { mode: 'signin' } : { mode: 'create' });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'create') {
        const created = createAccount(firstName, lastName);
        setSuccess(`Welcome, ${getLocalAccountDisplayName(created)}. Your account is ready.`);
        setFirstName('');
        setLastName('');
        window.setTimeout(() => navigate('/'), 900);
      } else {
        const signedIn = signIn(firstName, lastName);
        setSuccess(`Signed in as ${getLocalAccountDisplayName(signedIn)}.`);
        setFirstName('');
        setLastName('');
        window.setTimeout(() => navigate('/'), 900);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      <div className="max-w-lg">
        <h1 className="text-3xl font-extrabold m-0 mb-2">{title}</h1>
        <p className="text-sm text-text-muted m-0 mb-6 leading-relaxed">{subtitle}</p>

        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setMode('create')}
            className={`px-3 py-1.5 text-sm font-semibold rounded-sm border cursor-pointer ${
              mode === 'create'
                ? 'border-brand-red bg-brand-red text-white'
                : 'border-border bg-surface text-text hover:border-brand-red'
            }`}
          >
            Create account
          </button>
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`px-3 py-1.5 text-sm font-semibold rounded-sm border cursor-pointer ${
              mode === 'signin'
                ? 'border-brand-red bg-brand-red text-white'
                : 'border-border bg-surface text-text hover:border-brand-red'
            }`}
          >
            Sign in
          </button>
        </div>

        {account ? (
          <div className="mb-6 border border-border rounded-sm bg-surface p-4">
            <p className="text-sm m-0 mb-2">
              Signed in as <strong>{getLocalAccountDisplayName(account)}</strong>
            </p>
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="secondary" size="sm" onClick={() => signOut()}>
                Sign out
              </Button>
              <Link
                to="/my-quotes"
                className="inline-flex items-center text-sm text-brand-red no-underline hover:underline"
              >
                My Quotes
              </Link>
            </div>
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="border border-border rounded-sm bg-surface p-5 space-y-4"
        >
          <div>
            <label htmlFor="first-name" className="text-sm font-semibold text-text-secondary block mb-1.5">
              First name
            </label>
            <input
              id="first-name"
              type="text"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full border border-border rounded-sm px-3 py-2 text-sm bg-surface text-text focus:outline-none focus:border-brand-red"
            />
          </div>
          <div>
            <label htmlFor="last-name" className="text-sm font-semibold text-text-secondary block mb-1.5">
              Last name
            </label>
            <input
              id="last-name"
              type="text"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full border border-border rounded-sm px-3 py-2 text-sm bg-surface text-text focus:outline-none focus:border-brand-red"
            />
          </div>

          {error ? (
            <p className="text-sm text-red-700 m-0" role="alert">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="text-sm text-green-800 m-0" role="status">
              {success}
            </p>
          ) : null}

          <Button type="submit">{mode === 'create' ? 'Create account' : 'Sign in'}</Button>
        </form>

        {sortedAccounts.length > 0 ? (
          <section className="mt-8">
            <h2 className="text-sm font-bold uppercase tracking-wide text-text-secondary m-0 mb-3">
              Accounts on this device
            </h2>
            <ul className="list-none m-0 p-0 space-y-2">
              {sortedAccounts.map((item) => {
                const isActive = account?.id === item.id;
                return (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-2 border border-border rounded-sm px-3 py-2 bg-surface"
                  >
                    <span className="text-sm">
                      {getLocalAccountDisplayName(item)}
                      {isActive ? (
                        <span className="ml-2 text-xs text-brand-red font-semibold">Active</span>
                      ) : null}
                    </span>
                    <div className="flex gap-2">
                      {!isActive ? (
                        <button
                          type="button"
                          onClick={() => {
                            try {
                              signIn(item.firstName, item.lastName);
                              setSuccess(`Signed in as ${getLocalAccountDisplayName(item)}.`);
                              setError(null);
                            } catch (err) {
                              setError(err instanceof Error ? err.message : 'Sign in failed.');
                            }
                          }}
                          className="text-xs text-brand-red bg-transparent border-none cursor-pointer hover:underline p-0"
                        >
                          Use
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Remove ${getLocalAccountDisplayName(item)} from this device?`,
                            )
                          ) {
                            removeAccount(item.id);
                          }
                        }}
                        className="text-xs text-text-muted bg-transparent border-none cursor-pointer hover:text-brand-red hover:underline p-0"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
