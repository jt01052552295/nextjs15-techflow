import 'server-only';
import { I18N_CONFIG } from '@/constants/i18n';
import type { LocaleType } from '@/constants/i18n';
import { getValueByPath, replaceVariables } from './translation-utils';

// 사전 데이터의 타입 정의
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Dictionary = Record<string, any>;

type GetDictionaryFunction = (locale: LocaleType) => Promise<Dictionary>;

// 캐시 없이 사전 데이터를 가져오는 함수
export const getDictionary: GetDictionaryFunction = async (
  locale: LocaleType,
) => {
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

    console.log(`Loaded dictionary for locale: ${locale}`);

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
};

/**
 * 서버 컴포넌트용 번역 함수
 * 서버에서 동적으로 번역 데이터를 로드합니다.
 * @param key 번역 키 (예: 'common.AppName' 또는 'greeting')
 * @param variables 치환할 변수 (예: { name: '홍길동' })
 * @param locale 사용할 언어 (필수)
 * @returns 번역된 텍스트 또는 빈 문자열
 */
export const translateServer = async (
  key: string,
  variables?: Record<string, any>,
  locale: LocaleType = I18N_CONFIG.defaultLocale,
): Promise<string> => {
  try {
    console.log('__ts using locale:', locale);

    const dictionary = await getDictionary(locale);

    // 키에 네임스페이스가 포함되어 있는지 확인
    let fullKey = key;
    if (!key.includes('.')) {
      // 기본적으로 common 네임스페이스 사용
      fullKey = `common.${key}`;
    }

    // 값 가져오기
    const value = getValueByPath(dictionary, fullKey);

    // 값이 없으면 빈 문자열 반환 (개발 모드에서는 경고 표시)
    if (value === undefined || value === null) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[i18n] Translation key not found: ${fullKey}`);
      }
      return '';
    }

    // 변수 치환 후 반환
    return replaceVariables(value, variables);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[i18n] Translation error for key: ${key}`, error);
    }
    return '';
  }
};

// 기존 함수 이름 유지 (하위 호환성)
export const __ts = translateServer;
