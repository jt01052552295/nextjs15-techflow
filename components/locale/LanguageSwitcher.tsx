'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/components/context/LanguageContext';
import { LocaleType } from '@/types/locales';

const LanguageSwitcher = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { locale, setLocale } = useLanguage();
  const [selected, setSelected] = useState<string>(locale);

  const changeLanguage = (newLocale: LocaleType) => {
    if (newLocale !== locale) {
      setLocale(newLocale);
      router.push(`/${newLocale}/main`);
    }
    // const currentPath = window.location.pathname;
    // const pathSegments = currentPath.split('/').filter(Boolean);
    // const currentLocale = pathSegments[0] || locale; // 기본 로케일 설정

    // const newPath = `/${newLocale}/main`;
    // router.push(newPath);
    // setSelected(newLocale);
  };

  const getLanguageName = (locale: string) => {
    switch (locale) {
      case 'ko':
        return '한국어';
      case 'en':
        return 'English';
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
          <li>
            <button onClick={() => changeLanguage('ko')}>ko</button>
          </li>
          <li>
            <button onClick={() => changeLanguage('en')}>en</button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
