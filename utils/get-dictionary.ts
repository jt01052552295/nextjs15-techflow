import 'server-only';
import { unstable_cache } from 'next/cache';
import { I18N_CONFIG } from '@/constants/i18n';
import type { LocaleType } from '@/constants/i18n';

// 사전 데이터의 타입 정의
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Dictionary = Record<string, any>;

type GetDictionaryFunction = (locale: LocaleType) => Promise<Dictionary>;

export const getDictionary: GetDictionaryFunction = unstable_cache(
  async (locale: LocaleType) => {
    try {
      const [columns, common, routes] = await Promise.all([
        import(`@/locales/${locale}/columns.json`).then(
          (module) => module.default,
        ),
        import(`@/locales/${locale}/common.json`).then(
          (module) => module.default,
        ),
        import(`@/locales/${locale}/routes.json`).then(
          (module) => module.default,
        ),
      ]);

      return {
        columns,
        common,
        routes,
      };
    } catch (error) {
      console.error(`[Dictionary Load Error] locale: ${locale}`, error);

      if (locale !== I18N_CONFIG.defaultLocale) {
        console.warn(
          `Falling back to default locale: ${I18N_CONFIG.defaultLocale}`,
        );
        return getDictionary(I18N_CONFIG.defaultLocale);
      }

      throw new Error(`Failed to load dictionary for locale: ${locale}`);
    }
  },
  ['dictionary'],
  {
    revalidate: process.env.NODE_ENV === 'development' ? false : 3600,
    tags: ['dictionary'],
  },
);

export async function invalidateDictionaryCache() {
  try {
    await fetch('/api/revalidate?tag=dictionary', { method: 'POST' });
    console.log('Dictionary cache invalidated successfully');
  } catch (error) {
    console.error('Failed to invalidate dictionary cache:', error);
  }
}
