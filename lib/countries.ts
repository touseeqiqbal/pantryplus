/**
 * Country catalogue + helpers that make Pantry Plus locale-aware.
 *
 * A selected country drives:
 *  - currency (formatting of prices/budgets/costing)
 *  - measurement units (metric vs imperial) shown to the user
 *  - AI context: local cuisines, currency and units so suggestions, budgets and
 *    recipes match where the user actually lives.
 *
 * This is intentionally a plain data module (no React) so it can be used in
 * client components, hooks, and server-side AI routes alike.
 */

export interface Country {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  flag: string; // emoji
  currency: string; // ISO 4217
  currencySymbol: string;
  locale: string; // BCP-47, for Intl formatting
  units: 'metric' | 'imperial';
  cuisines: string[]; // hints used to localise AI suggestions
}

export const COUNTRIES: Country[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', currencySymbol: '$', locale: 'en-US', units: 'imperial', cuisines: ['American', 'Tex-Mex', 'BBQ'] },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', currencySymbol: '£', locale: 'en-GB', units: 'metric', cuisines: ['British', 'Indian', 'Sunday roast'] },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', currency: 'CAD', currencySymbol: '$', locale: 'en-CA', units: 'metric', cuisines: ['Canadian', 'American', 'French'] },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', currency: 'AUD', currencySymbol: '$', locale: 'en-AU', units: 'metric', cuisines: ['Australian', 'Asian fusion', 'BBQ'] },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰', currency: 'PKR', currencySymbol: 'Rs', locale: 'en-PK', units: 'metric', cuisines: ['Pakistani', 'Desi', 'Halal', 'Mughlai'] },
  { code: 'IN', name: 'India', flag: '🇮🇳', currency: 'INR', currencySymbol: '₹', locale: 'en-IN', units: 'metric', cuisines: ['Indian', 'South Indian', 'Vegetarian', 'Mughlai'] },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩', currency: 'BDT', currencySymbol: '৳', locale: 'en-BD', units: 'metric', cuisines: ['Bangladeshi', 'Bengali', 'Halal'] },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', currency: 'AED', currencySymbol: 'د.إ', locale: 'en-AE', units: 'metric', cuisines: ['Emirati', 'Arab', 'Lebanese', 'Halal'] },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', currency: 'SAR', currencySymbol: '﷼', locale: 'ar-SA', units: 'metric', cuisines: ['Saudi', 'Arab', 'Halal'] },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦', currency: 'QAR', currencySymbol: '﷼', locale: 'en-QA', units: 'metric', cuisines: ['Qatari', 'Arab', 'Halal'] },
  { code: 'TR', name: 'Türkiye', flag: '🇹🇷', currency: 'TRY', currencySymbol: '₺', locale: 'tr-TR', units: 'metric', cuisines: ['Turkish', 'Mediterranean', 'Halal'] },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', currency: 'EGP', currencySymbol: 'E£', locale: 'ar-EG', units: 'metric', cuisines: ['Egyptian', 'Arab', 'Mediterranean'] },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', currency: 'ZAR', currencySymbol: 'R', locale: 'en-ZA', units: 'metric', cuisines: ['South African', 'Braai', 'Cape Malay'] },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', currency: 'NGN', currencySymbol: '₦', locale: 'en-NG', units: 'metric', cuisines: ['Nigerian', 'West African'] },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', currency: 'KES', currencySymbol: 'KSh', locale: 'en-KE', units: 'metric', cuisines: ['Kenyan', 'East African'] },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', currency: 'EUR', currencySymbol: '€', locale: 'de-DE', units: 'metric', cuisines: ['German', 'European'] },
  { code: 'FR', name: 'France', flag: '🇫🇷', currency: 'EUR', currencySymbol: '€', locale: 'fr-FR', units: 'metric', cuisines: ['French', 'Mediterranean'] },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', currency: 'EUR', currencySymbol: '€', locale: 'it-IT', units: 'metric', cuisines: ['Italian', 'Mediterranean'] },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', currency: 'EUR', currencySymbol: '€', locale: 'es-ES', units: 'metric', cuisines: ['Spanish', 'Mediterranean', 'Tapas'] },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', currency: 'EUR', currencySymbol: '€', locale: 'nl-NL', units: 'metric', cuisines: ['Dutch', 'European'] },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', currency: 'EUR', currencySymbol: '€', locale: 'en-IE', units: 'metric', cuisines: ['Irish', 'European'] },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', currency: 'SEK', currencySymbol: 'kr', locale: 'sv-SE', units: 'metric', cuisines: ['Swedish', 'Nordic'] },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', currency: 'CHF', currencySymbol: 'CHF', locale: 'de-CH', units: 'metric', cuisines: ['Swiss', 'European'] },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', currency: 'SGD', currencySymbol: '$', locale: 'en-SG', units: 'metric', cuisines: ['Singaporean', 'Chinese', 'Malay', 'Indian'] },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', currency: 'MYR', currencySymbol: 'RM', locale: 'en-MY', units: 'metric', cuisines: ['Malaysian', 'Halal', 'Chinese', 'Indian'] },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', currency: 'IDR', currencySymbol: 'Rp', locale: 'id-ID', units: 'metric', cuisines: ['Indonesian', 'Halal', 'Asian'] },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', currency: 'PHP', currencySymbol: '₱', locale: 'en-PH', units: 'metric', cuisines: ['Filipino', 'Asian'] },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', currency: 'JPY', currencySymbol: '¥', locale: 'ja-JP', units: 'metric', cuisines: ['Japanese', 'Asian'] },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', currency: 'KRW', currencySymbol: '₩', locale: 'ko-KR', units: 'metric', cuisines: ['Korean', 'Asian'] },
  { code: 'CN', name: 'China', flag: '🇨🇳', currency: 'CNY', currencySymbol: '¥', locale: 'zh-CN', units: 'metric', cuisines: ['Chinese', 'Sichuan', 'Cantonese'] },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', currency: 'BRL', currencySymbol: 'R$', locale: 'pt-BR', units: 'metric', cuisines: ['Brazilian', 'Latin American'] },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', currency: 'MXN', currencySymbol: '$', locale: 'es-MX', units: 'metric', cuisines: ['Mexican', 'Latin American'] },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', currency: 'ARS', currencySymbol: '$', locale: 'es-AR', units: 'metric', cuisines: ['Argentine', 'Latin American', 'BBQ'] },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', currency: 'NZD', currencySymbol: '$', locale: 'en-NZ', units: 'metric', cuisines: ['New Zealand', 'Asian fusion'] },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', currency: 'PLN', currencySymbol: 'zł', locale: 'pl-PL', units: 'metric', cuisines: ['Polish', 'European'] },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', currency: 'EUR', currencySymbol: '€', locale: 'pt-PT', units: 'metric', cuisines: ['Portuguese', 'Mediterranean'] },
];

export const DEFAULT_COUNTRY_CODE = 'US';

const COUNTRY_BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c]));

/** Resolve a country by code, falling back to the default (never returns undefined). */
export function getCountry(code?: string | null): Country {
  return (code && COUNTRY_BY_CODE.get(code)) || COUNTRY_BY_CODE.get(DEFAULT_COUNTRY_CODE)!;
}

/** Format an amount in the country's currency, with a safe fallback. */
export function formatCurrency(amount: number, country: Country): string {
  try {
    return new Intl.NumberFormat(country.locale, {
      style: 'currency',
      currency: country.currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${country.currencySymbol}${amount.toFixed(2)}`;
  }
}
