// context/RoutesContext.tsx
'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { generateLocalizedRoutes, AdminRoutes } from '@/utils/routes';
import { useLanguage } from '@/components/context/LanguageContext';

const RoutesContext = createContext<AdminRoutes | null>(null);

export const RoutesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { dictionary, locale } = useLanguage();
  const routes = useMemo(
    () => generateLocalizedRoutes(locale, dictionary),
    [locale, dictionary],
  );

  return (
    <RoutesContext.Provider value={routes}>{children}</RoutesContext.Provider>
  );
};

export const useRoutes = (): AdminRoutes => {
  const context = useContext(RoutesContext);
  if (!context) {
    throw new Error('useRoutes must be used within a RoutesProvider');
  }
  return context;
};
