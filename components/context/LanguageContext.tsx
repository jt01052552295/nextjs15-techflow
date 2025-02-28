'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LocaleType } from '@/constants/i18n';
import type { Dictionary } from '@/utils/get-dictionary'; // Dictionary 타입 import
interface LanguageContextProps {
  locale: LocaleType;
  setLocale: (locale: LocaleType) => void;
  dictionary: Dictionary;
  setDictionary: (dictionary: Dictionary) => void;
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
  initialDictionary: Dictionary;
}) => {
  const [locale, setLocale] = useState(initialLocale);
  const [dictionary, setDictionary] = useState(initialDictionary);

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
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
