import '@/scss/global.scss';
import InstallBootstrap from '@/components/helpers/InstallBootstrap';
import { getDictionary } from '@/utils/get-dictionary';
import { LanguageProvider } from '@/components/context/LanguageContext';
import { LocaleType, I18N_CONFIG } from '@/constants/i18n';
import { Metadata } from 'next';
import { LanguageSwitcher } from '@/components/locale/LanguageSwitcher';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;

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
    <LanguageProvider initialLocale={language} initialDictionary={dictionary}>
      <html lang={language}>
        <body>
          <InstallBootstrap />
          <header>
            <LanguageSwitcher />
          </header>
          {children}
        </body>
      </html>
    </LanguageProvider>
  );
}

export function generateStaticParams() {
  return I18N_CONFIG.locales.map((lang) => ({ language: lang }));
}
