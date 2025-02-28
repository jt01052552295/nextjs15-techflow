'use client';
import { useLanguage } from '@/components/context/LanguageContext';
import Navigation from '@/components/common/Navigation';

const Main = () => {
  const { dictionary, locale } = useLanguage();
  return (
    <div>
      <Navigation />
      <h2>{dictionary.common.main}</h2>
      <span>Current language: {locale}</span>
    </div>
  );
};

export default Main;
