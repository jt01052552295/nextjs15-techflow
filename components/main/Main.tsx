'use client';
import { useEffect } from 'react';
import { useLanguage } from '@/components/context/LanguageContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/context/AuthContext';
import { getRouteUrl } from '@/utils/routes';
import SessionCountdown from '@/components/auth/SessionCountdown';
import cx from 'classnames';
import Footer from '../common/Footer';
import { useCollapseStore } from '@/store/sidebar';
import SidebarToggle from '../common/SidebarToggle';
import ThemeSwitch from '../common/ThemeSwitch';
import LoadingSpinner from '../common/LoadingSpinner';
import { LanguageSwitcher } from '../locale/LanguageSwitcher';
import ShortMenu from '../common/ShortMenu';
import ShortProfile from '../common/ShortProfile';

type Props = {
  children: React.ReactNode[];
};

const Main = ({ children }: Props) => {
  const { locale } = useLanguage();
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();
  const { collapse } = useCollapseStore();

  // 인증 상태 확인 및 리다이렉트
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(getRouteUrl('auth.login', locale));
    }
  }, [isLoading, isAuthenticated, router, locale]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null; // 리다이렉트 중에는 아무것도 표시하지 않음
  }
  return (
    <div
      className={cx('main', {
        'sidebar-collapsed': !collapse,
        'sidebar-expanded': collapse,
      })}
    >
      <nav className="navbar navbar-expand navbar-light navbar-bg">
        <SidebarToggle />
        <ThemeSwitch />
        <LanguageSwitcher />
        <SessionCountdown />
        <ShortMenu />
        <ShortProfile />
      </nav>
      <main className="content">{children}</main>
      <Footer />
    </div>
  );
};

export default Main;
