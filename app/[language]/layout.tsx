import '@/scss/global.scss';
import InstallBootstrap from '@/components/helpers/InstallBootstrap';
import { getDictionary } from '@/utils/get-dictionary';
import { LanguageProvider } from '@/components/context/LanguageContext';
import { AuthProvider } from '@/components/context/AuthContext';
import { LocaleType, I18N_CONFIG } from '@/constants/i18n';
import { Metadata } from 'next';
import { Toaster } from 'sonner';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { ThemeProvider } from '@/components/context/ThemeProvider';
import RQProvider from '@/components/util/RQProvider';

config.autoAddCss = false;

export async function generateMetadata({
  params,
}: {
  params: { language: LocaleType };
}): Promise<Metadata> {
  const { language } = await params;
  const dictionary = await getDictionary(language);
  const AppName =
    process.env.NEXT_PUBLIC_MODE === 'development'
      ? dictionary.common.AppName + '::DEV'
      : dictionary.common.AppName;

  return {
    title: {
      template: `%s | ${AppName}`,
      default: AppName, // a default is required when creating a template
    },
    description: dictionary.common.AppDesc,
    keywords: ['Next.js', 'React', 'JavaScript'],
    robots: {
      index: false,
      follow: false,
    },
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
  // console.log('Dictionary being passed to provider:', dictionary.common.auth);

  return (
    <LanguageProvider initialLocale={language} initialDictionary={dictionary}>
      <AuthProvider>
        <html lang={language} suppressHydrationWarning>
          <body>
            <RQProvider>
              <ThemeProvider
                enableSystem={false}
                attribute="data-bs-theme"
                disableTransitionOnChange
              >
                <InstallBootstrap />
                {children}
                <Toaster
                  closeButton
                  richColors
                  position="top-center"
                  expand={false}
                  visibleToasts={1}
                  duration={3000}
                />
              </ThemeProvider>
            </RQProvider>
          </body>
        </html>
      </AuthProvider>
    </LanguageProvider>
  );
}

export function generateStaticParams() {
  return I18N_CONFIG.locales.map((lang) => ({ language: lang }));
}
