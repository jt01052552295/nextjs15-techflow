'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { I18N_CONFIG } from '@/constants/i18n';
import { useLanguage } from '@/components/context/LanguageContext';
import cx from 'classnames';

export function LanguageSwitcher() {
  const router = useRouter();
  const { locale } = useLanguage();
  const pathname = usePathname();
  const [selected, setSelected] = useState<string>(locale);

  const changeLanguage = (newLocale: string) => {
    // 현재 경로에서 로케일 변경
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
    setSelected(newLocale);
  };
  const getLanguageName = (locale: string) => {
    switch (locale) {
      case 'ko':
        return '한국어';
      case 'en':
        return 'English';
      case 'ja':
        return '日本語';
      case 'zh':
        return '中文';
      default:
        return 'Language';
    }
  };

  return (
    <div className="ms-1">
      <div className="dropdown">
        <button
          className="btn btn-light btn-sm dropdown-toggle"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          {getLanguageName(selected)}
        </button>
        <ul className="dropdown-menu">
          {I18N_CONFIG.locales.map((lang) => (
            <li key={lang}>
              <button
                className={cx('dropdown-item', { active: locale === lang })}
                onClick={() => changeLanguage(lang)}
              >
                {getLanguageName(lang)}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
