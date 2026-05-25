export type CurrencyCode =
  | 'EGP'
  | 'SAR'
  | 'AED'
  | 'USD'
  | 'KWD'
  | 'QAR'
  | 'BHD'
  | 'OMR'
  | 'JOD';

export const CURRENCY_PRESETS: Record<
  CurrencyCode,
  { symbol: string; locale: string; label: string }
> = {
  EGP: { symbol: 'ج.م', locale: 'ar-EG', label: 'جنيه مصري (ج.م)' },
  SAR: { symbol: 'ر.س', locale: 'ar-SA', label: 'ريال سعودي (ر.س)' },
  AED: { symbol: 'د.إ', locale: 'ar-AE', label: 'درهم إماراتي (د.إ)' },
  USD: { symbol: '$', locale: 'en-US', label: 'دولار أمريكي ($)' },
  KWD: { symbol: 'د.ك', locale: 'ar-KW', label: 'دينار كويتي (د.ك)' },
  QAR: { symbol: 'ر.ق', locale: 'ar-QA', label: 'ريال قطري (ر.ق)' },
  BHD: { symbol: 'د.ب', locale: 'ar-BH', label: 'دينار بحريني (د.ب)' },
  OMR: { symbol: 'ر.ع', locale: 'ar-OM', label: 'ريال عماني (ر.ع)' },
  JOD: { symbol: 'د.أ', locale: 'ar-JO', label: 'دينار أردني (د.أ)' },
};

export const CURRENCY_OPTIONS = (Object.keys(CURRENCY_PRESETS) as CurrencyCode[]).map(
  (code) => ({ code, ...CURRENCY_PRESETS[code] })
);

export function resolveCurrencyCode(code?: string | null): CurrencyCode {
  if (code && code in CURRENCY_PRESETS) return code as CurrencyCode;
  return 'EGP';
}

export function formatPrice(
  amount: number,
  currencyCode?: string | null,
  options?: { approximate?: boolean }
): string {
  const code = resolveCurrencyCode(currencyCode);
  const { symbol, locale } = CURRENCY_PRESETS[code];
  const prefix = options?.approximate ? '~' : '';
  return `${prefix}${amount.toLocaleString(locale)} ${symbol}`;
}

export function getCurrencyFromGlobal(global: { currency?: string | null }): CurrencyCode {
  return resolveCurrencyCode(global.currency);
}
