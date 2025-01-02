'use client';
import { useLanguage } from '@/components/context/LanguageContext';
import Navigation from '@/components/common/Navigation';

const Main = () => {
  const { dictionary, locale } = useLanguage();
  return (
    <div>
      <Navigation />
      <h6>{dictionary.routes.main.index.name}</h6>
      <p>{dictionary.routes.main.index.desc}</p>
    </div>
  );
};

export default Main;
