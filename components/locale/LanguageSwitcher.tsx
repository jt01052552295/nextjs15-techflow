'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { I18N_CONFIG } from '@/constants/i18n';
import { useLanguage } from '@/components/context/LanguageContext';

export function LanguageSwitcher() {
  const { locale } = useLanguage();
  const pathname = usePathname();

  return (
    <div className="language-switcher">
      {I18N_CONFIG.locales.map((lang) => {
        const newPath = pathname.replace(`/${locale}`, `/${lang}`);

        return (
          <Link
            key={lang}
            href={newPath}
            className={`lang-link ${locale === lang ? 'active' : ''}`}
            locale={lang}
          >
            {lang === 'ko' ? '한국어' : 'English'}
          </Link>
        );
      })}
    </div>
  );
}
