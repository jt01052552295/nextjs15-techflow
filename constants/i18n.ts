export const I18N_CONFIG = {
  defaultLocale: 'ko' as const,
  locales: ['ko', 'en'] as const,
  defaultRedirect: 'main' as const,
} as const;

export type LocaleType = (typeof I18N_CONFIG.locales)[number];
