'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { logoutAction } from '@/actions/auth/logout';
import { toast } from 'sonner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useLanguage } from '@/components/context/LanguageContext';
import { getRouteUrl } from '@/utils/routes';

type LogoutButtonProps = {
  className?: string;
  variant?: 'button' | 'link' | 'dropdown' | 'sidebar';
  showIcon?: boolean;
};

const LogoutButton = ({
  className = '',
  variant = 'button',
  showIcon = true,
}: LogoutButtonProps) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { dictionary, locale, t } = useLanguage();

  const handleLogout = () => {
    startTransition(async () => {
      try {
        const result = await logoutAction();
        if (result.status == 'success') {
          toast.success(result.message);
          router.push(getRouteUrl('auth.login', locale));
          // 페이지 새로고침으로 모든 상태 초기화
          router.refresh();
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        console.error('로그아웃 오류:', error);
        toast.error(t('common.auth.logout.fail'));
      }
    });
  };

  // 버튼 스타일에 따라 다른 UI 렌더링
  if (variant === 'link') {
    return (
      <a
        href="#"
        className={`${className}`}
        onClick={(e) => {
          e.preventDefault();
          handleLogout();
        }}
      >
        {showIcon && <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />}
        {isPending ? t('common.loading') : t('common.auth.logout.button')}
      </a>
    );
  } else if (variant === 'dropdown') {
    return (
      <button
        className={`dropdown-item ${className}`}
        onClick={handleLogout}
        disabled={isPending}
      >
        {showIcon && <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />}
        {isPending ? t('common.loading') : t('common.auth.logout.button')}
      </button>
    );
  } else if (variant === 'sidebar') {
    return (
      <button
        className={`list-group-item list-group-item-action ${className}`}
        onClick={handleLogout}
        disabled={isPending}
      >
        {showIcon && <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />}
        {isPending ? t('common.loading') : t('common.auth.logout.button')}
      </button>
    );
  }

  // 기본 버튼 스타일
  return (
    <button
      className={`btn btn-outline-secondary ${className}`}
      onClick={handleLogout}
      disabled={isPending}
    >
      {showIcon && <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />}
      {isPending ? t('common.loading') : t('common.auth.logout.button')}
    </button>
  );
};

export default LogoutButton;
