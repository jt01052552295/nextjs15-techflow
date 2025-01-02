'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { LocaleType } from '@/types/locales';

interface LanguageContextProps {
  locale: LocaleType;
  setLocale: (locale: LocaleType) => void;
  dictionary: any;
  setDictionary: (dictionary: any) => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(
  undefined,
);

export const LanguageProvider = ({
  children,
  initialLocale,
  initialDictionary,
}: {
  children: ReactNode;
  initialLocale: LocaleType;
  initialDictionary: any;
}) => {
  const [locale, setLocale] = useState(initialLocale);
  const [dictionary, setDictionary] = useState(initialDictionary);

  useEffect(() => {
    setLocale(initialLocale);
    setDictionary(initialDictionary);
  }, [initialLocale, initialDictionary]);

  return (
    <LanguageContext.Provider
      value={{ locale, setLocale, dictionary, setDictionary }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
