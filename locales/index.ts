import 'server-only';
import { LocaleType } from '@/types/locales';

const loadAllFilesInDirectory = async (locale: LocaleType): Promise<any> => {
  const namespaces = {
    columns: await import(`./${locale}/columns.json`).then(
      (module) => module.default,
    ),
    common: await import(`./${locale}/common.json`).then(
      (module) => module.default,
    ),
    routes: await import(`./${locale}/routes.json`).then(
      (module) => module.default,
    ),
  };

  return namespaces; // 네임스페이스로 분리된 데이터 반환
};

export const getDictionary = async (locale: LocaleType): Promise<any> => {
  try {
    return await loadAllFilesInDirectory(locale);
  } catch (error) {
    console.warn(
      `Error loading locale files for ${locale}, falling back to 'ko'`,
    );
    return await loadAllFilesInDirectory('ko'); // 기본 언어로 fallback
  }
};
