import type { Metadata } from 'next';
import { LocaleType } from '@/types/locales';
import { getDictionary } from '@/locales';
import { LanguageProvider } from '@/components/context/LanguageContext';
import LanguageSwitcher from '@/components/locale/LanguageSwitcher';
import { RoutesProvider } from '@/components/context/RoutesContext';

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: {
    language: LocaleType;
  };
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const { language } = await params;
  const dictionary = await getDictionary(language);

  return (
    <LanguageProvider initialLocale={language} initialDictionary={dictionary}>
      <RoutesProvider>
        <html lang={language} suppressHydrationWarning>
          <body>
            <header>
              <h5>{language}</h5>
              <LanguageSwitcher />
            </header>
            {children}
          </body>
        </html>
      </RoutesProvider>
    </LanguageProvider>
  );
}
