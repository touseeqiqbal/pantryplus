'use client';

/**
 * Country/locale context. Single source of truth for the user's country across
 * the whole app — drives currency formatting and feeds the AI its locale.
 *
 * Backed by localStorage so it works everywhere, including during registration
 * (before any household/Firestore document exists). When a user is signed in we
 * also best-effort mirror the choice to their `users/{uid}` profile so it can
 * follow them across devices.
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import {
  COUNTRIES,
  DEFAULT_COUNTRY_CODE,
  getCountry,
  formatCurrency,
  type Country,
} from '@/lib/countries';

const STORAGE_KEY = 'pantryplus_country';

interface CountryContextType {
  country: Country;
  countryCode: string;
  countries: Country[];
  setCountryCode: (code: string) => void;
  /** Format a number in the selected country's currency. */
  formatPrice: (amount: number) => string;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export function CountryProvider({ children }: { children: ReactNode }) {
  const [countryCode, setCode] = useState<string>(DEFAULT_COUNTRY_CODE);

  // Hydrate from localStorage on the client (avoids SSR hydration mismatch).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved !== countryCode) setCode(saved);
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setCountryCode = useCallback((code: string) => {
    setCode(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* ignore */
    }
  }, []);

  const country = getCountry(countryCode);

  const formatPrice = useCallback((amount: number) => formatCurrency(amount, country), [country]);

  return (
    <CountryContext.Provider
      value={{ country, countryCode, countries: COUNTRIES, setCountryCode, formatPrice }}
    >
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const ctx = useContext(CountryContext);
  if (!ctx) throw new Error('useCountry must be used within a CountryProvider');
  return ctx;
}
