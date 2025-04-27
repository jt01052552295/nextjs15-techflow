'use client';
import { useEffect } from 'react';
import { useLanguage } from '@/components/context/LanguageContext';
import Link from 'next/link';
import cx from 'classnames';
import Navigation from '@/components/common/Navigation';
import LogoutButton from '@/components/auth/LogoutButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';
import { useCollapseStore } from '@/store/sidebar';

import UserProfileWidget from '@/components/common/UserProfileWidget';

const Sidebar = () => {
  const { t } = useLanguage();
  const { collapse, setCollapse } = useCollapseStore();

  useEffect(() => {
    // 디바운싱을 위한 함수
    const debounce = <F extends (...args: any[]) => any>(
      func: F,
      delay: number,
    ) => {
      let timeoutId: ReturnType<typeof setTimeout> | null = null;

      return (...args: Parameters<F>) => {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
      };
    };
    const handleResize = debounce(() => {
      if (window.innerWidth < 768) {
        setCollapse(false);
      } else {
        setCollapse(true);
      }
    }, 250); // 250ms 디바운스
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [setCollapse]);

  return (
    <nav
      className={cx('sidebar', { collapsed: !collapse, expanded: collapse })}
    >
      <div className="sidebar-content shadow-sm bg-body-tertiary">
        <div className="sidebar-logo">
          <h1 className="fs-5 m-0 text-center">
            <Link href="/" className="link-body-emphasis text-decoration-none">
              {t('common.AppName')}
            </Link>
          </h1>
        </div>
        <UserProfileWidget collapse={collapse} />
        <Navigation />

        <div className="list-group list-group-flush mt-auto list-group-bottom">
          <Link
            href="#"
            className="list-group-item list-group-item-action"
            aria-current="true"
          >
            <FontAwesomeIcon icon={faGear} />
            &nbsp;{t('common.settings')}
          </Link>
          <LogoutButton variant="sidebar" />
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
