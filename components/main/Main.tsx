'use client';
import { useEffect } from 'react';
import { useLanguage } from '@/components/context/LanguageContext';
import Navigation from '@/components/common/Navigation';
import LogoutButton from '../auth/LogoutButton';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/context/AuthContext';
import { getRouteUrl } from '@/utils/routes';
import SessionCountdown from '@/components/auth/SessionCountdown';
const Main = () => {
  const { dictionary, locale } = useLanguage();
  const router = useRouter();
  const { user, isLoading, isAuthenticated } = useAuth();

  // 인증 상태 확인 및 리다이렉트
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(getRouteUrl('auth.login', locale));
    }
  }, [isLoading, isAuthenticated, router, locale]);

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (!user) {
    return null; // 리다이렉트 중에는 아무것도 표시하지 않음
  }
  return (
    <div>
      <Navigation />
      <LogoutButton />
      <SessionCountdown />
      <h2>{dictionary.common.main}</h2>
      <span>Current language: {locale}</span>
      <div>
        <h1>프로필</h1>
        <p>이메일: {user.email}</p>
        <p>이름: {user.name}</p>
        <p>역할: {user.role}</p>
      </div>
    </div>
  );
};

export default Main;
