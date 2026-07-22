import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { countriesByRegion } from '../../data/countries';
import { useCatalog } from '../../context/CatalogContext';
import type { CountryId } from '../../types';
import { EquinixLogo } from './EquinixLogo';
import { ThemeToggle } from './ThemeToggle';
import { sortCountriesByCatalogFrequency } from '../../utils/countryCatalogFrequency';
import { SignInButton, useMicrosoftAccount } from '../auth/SignInButton';
import { CartLink } from '../cart/CartLink';
import { useLocalAccount } from '../../context/LocalAccountContext';

function AppLauncherMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const account = useMicrosoftAccount();

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const items = [
    { label: 'Excel Data', to: '/excel' as const },
    { label: 'Account', to: '/account' as const },
  ];

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        type="button"
        aria-label="Open app menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="w-9 h-9 flex items-center justify-center rounded-sm border-none bg-transparent cursor-pointer hover:bg-white/10 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="white" aria-hidden>
          {[0, 1, 2].map((row) =>
            [0, 1, 2].map((col) => (
              <circle key={`${row}-${col}`} cx={2 + col * 6} cy={2 + row * 6} r="1.5" />
            )),
          )}
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-52 bg-surface text-text border border-border rounded-sm shadow-xl z-50 py-1">
          {items.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-text no-underline hover:bg-accent-subtle hover:text-brand-red"
            >
              {item.label}
            </Link>
          ))}
          <SignInButton
            onClick={() => setOpen(false)}
            className="w-full text-left px-4 py-2.5 text-sm border-none bg-transparent cursor-pointer hover:bg-accent-subtle hover:text-brand-red"
          >
            {account ? 'Sign out of Microsoft' : 'Microsoft sign-in (Outlook)'}
          </SignInButton>
        </div>
      )}
    </div>
  );
}

function BrandMark() {
  return <EquinixLogo />;
}

function EnvironmentSelector() {
  const { countryName, locale, setUserCountryAndFilters } = useCatalog();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selectCountry = (countryId: CountryId, region: 'AMER' | 'APAC' | 'EMEA') => {
    setUserCountryAndFilters(countryId, region);
    setOpen(false);
  };

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex items-center gap-2.5 border-none bg-transparent cursor-pointer text-white px-2 py-1 rounded-sm hover:bg-white/10 transition-colors"
      >
        <span className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3c2.5 2.8 4 6 4 9s-1.5 6.2-4 9M12 3c-2.5 2.8-4 6-4 9s1.5 6.2 4 9" />
          </svg>
        </span>
        <span className="text-left hidden md:block">
          <span className="block text-[11px] text-white/70 leading-none mb-0.5">Location</span>
          <span className="block text-sm font-medium leading-tight whitespace-nowrap">
            {countryName}
            <span className="text-white/60 font-normal"> · {locale.languageLabel}</span>
          </span>
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 max-h-80 overflow-y-auto bg-surface text-text border border-border rounded-sm shadow-xl z-50">
          {Object.entries(countriesByRegion).map(([region, countries]) => (
            <div key={region}>
              <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-text-muted bg-surface-muted sticky top-0">
                {region}
              </div>
              {sortCountriesByCatalogFrequency(countries).map((country) => (
                <button
                  key={country.id}
                  type="button"
                  onClick={() => selectCountry(country.id, country.region)}
                  className={clsx(
                    'w-full text-left px-3 py-2 text-sm border-none cursor-pointer hover:bg-accent-subtle',
                    countryName === country.name && 'bg-accent-subtle text-brand-red font-semibold',
                  )}
                >
                  {country.name}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface MainHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function MainHeader({ search, onSearchChange }: MainHeaderProps) {
  const microsoftAccount = useMicrosoftAccount();
  const { displayName: localDisplayName } = useLocalAccount();
  const displayName = localDisplayName ?? microsoftAccount?.name ?? microsoftAccount?.username ?? null;

  return (
    <header className="bg-black text-white border-b border-black">
      <div className="max-w-[1440px] mx-auto px-4 min-h-14 h-auto py-1 flex items-center gap-3 lg:gap-4">
        <AppLauncherMenu />
        <BrandMark />
        <span className="text-sm font-semibold whitespace-nowrap hidden lg:inline text-white/95">
          Accessory Price List Quote Generator
        </span>

        <div className="flex-1 flex justify-end min-w-0 max-w-xl ml-auto mr-1 lg:mr-3">
          <div className="relative w-full">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-red pointer-events-none"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-4-4" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products and accessories..."
              className="w-full h-9 pl-10 pr-4 bg-white text-gray-900 border-none rounded-full text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-red/40"
            />
          </div>
        </div>

        <EnvironmentSelector />

        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle />

          <Link
            to={localDisplayName ? '/account' : '/account?mode=create'}
            aria-label={localDisplayName ? 'Account' : 'Create account or sign in'}
            title={localDisplayName ? 'Your account' : 'Create account or sign in with your name'}
            className="flex items-center gap-2 no-underline text-white rounded-sm hover:bg-white/10 transition-colors pl-1 pr-0.5 h-9"
          >
            {displayName ? (
              <span className="hidden xl:inline text-xs text-white/80 max-w-[140px] truncate">
                {displayName}
              </span>
            ) : null}
            <span className="w-9 h-9 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
          </Link>

          <CartLink />
        </div>
      </div>
    </header>
  );
}
