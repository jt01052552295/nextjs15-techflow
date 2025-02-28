import { getDictionary } from '@/utils/get-dictionary';
import { LanguageProvider } from '@/components/context/LanguageContext';
import { LocaleType, I18N_CONFIG } from '@/constants/i18n';
import { Metadata } from 'next';
import { LanguageSwitcher } from '@/components/locale/LanguageSwitcher';

export async function generateMetadata({
  params,
}: {
  params: { language: LocaleType };
}): Promise<Metadata> {
  const { language } = await params;
  const dictionary = await getDictionary(language);

  return {
    title: dictionary.common.siteTitle,
    description: dictionary.common.siteDescription,
    alternates: {
      languages: Object.fromEntries(
        I18N_CONFIG.locales.map((locale) => [locale, `/${locale}`]),
      ),
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { language: LocaleType };
}) {
  const { language } = await params;
  const dictionary = await getDictionary(language);

  return (
    <html lang={language}>
      <body>
        <LanguageProvider
          initialLocale={language}
          initialDictionary={dictionary}
        >
          <header>
            <LanguageSwitcher />
          </header>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}

export function generateStaticParams() {
  return I18N_CONFIG.locales.map((lang) => ({ language: lang }));
}
