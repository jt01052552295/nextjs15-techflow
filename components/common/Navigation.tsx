'use client';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/context/LanguageContext';
import useMount from '@/hooks/useMount';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import cx from 'classnames';
import { getRouteMetadata, getRouteUrl } from '@/utils/routes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faList,
  faCaretRight,
  faUser,
  faGears,
  faAngleDown,
  faBell,
  faCartShopping,
} from '@fortawesome/free-solid-svg-icons';

interface SubMenu {
  id: string;
  route: string;
  params?: Record<string, string>;
  customName?: string; // 개별적인 메뉴 이름을 위한 필드 추가
}

interface MainMenu {
  id: string;
  icon: typeof faHome; // 또는 IconDefinition
  route: string | null;
  subMenus: SubMenu[];
  customName?: string; // 개별적인 메뉴 이름을 위한 필드 추가
}

const Navigation = () => {
  const mount = useMount();
  const pathname = usePathname();
  const { dictionary, locale, t } = useLanguage();

  const menuStructure: MainMenu[] = [
    {
      id: 'dashboard',
      icon: faHome,
      route: 'main.index', // 대시보드
      subMenus: [],
    },
    {
      id: 'members',
      icon: faUser,
      route: 'user.index',
      subMenus: [
        { id: 'user-list', route: 'user.index' },
        { id: 'setting-list', route: 'setting.index' },
        { id: 'address-list', route: 'address.index' },
        { id: 'payment-list', route: 'payment.index' },
        { id: 'company-list', route: 'company.index' },
        { id: 'point-list', route: 'point.index' },
      ],
    },
    {
      id: 'board',
      icon: faList,
      route: 'board.index',
      subMenus: [
        { id: 'board-list', route: 'board.index' },
        { id: 'bbs-list', route: 'bbs.index' },
        { id: 'comment-list', route: 'comment.index' },
      ],
    },
    {
      id: 'fcm',
      icon: faBell,
      route: 'fcmTemplates.index',
      subMenus: [
        { id: 'fcmTemplates-list', route: 'fcmTemplates.index' },
        { id: 'fcmTokens-list', route: 'fcmTokens.index' },
        { id: 'fcmMessages-list', route: 'fcmMessages.index' },
        { id: 'fcmAlarms-list', route: 'fcmAlarms.index' },
      ],
    },
    {
      id: 'shop',
      icon: faCartShopping,
      route: 'shopItem.index',
      subMenus: [
        { id: 'shopCategory-list', route: 'shopCategory.index' },
        { id: 'shopItem-list', route: 'shopItem.index' },
      ],
    },
    {
      id: 'Config',
      icon: faGears,
      route: 'config.index',
      subMenus: [
        {
          id: 'config-list',
          route: 'config.index',
          customName: t('routes.config.index.navName'),
        },
        { id: 'setup-list', route: 'setup.create' },
        {
          id: 'config-edit-person',
          route: 'config.edit',
          params: { id: 'person' },
          customName: t('routes.config.edit.person'),
        },
        {
          id: 'config-edit-use',
          route: 'config.edit',
          params: { id: 'use' },
          customName: t('routes.config.edit.agree'),
        },
        {
          id: 'config-edit-email',
          route: 'config.edit',
          params: { id: 'email' },
          customName: t('routes.config.edit.email'),
        },
        { id: 'agent-list', route: 'agent.index' },
        { id: 'popup-list', route: 'popup.index' },
        { id: 'banner-list', route: 'banner.index' },
        { id: 'category-list', route: 'category.index' },
        { id: 'badge-master-list', route: 'badge.index' },
      ],
    },

    {
      id: 'Practice',
      icon: faUser,
      route: 'practice.index',
      subMenus: [],
    },
  ];

  const [openMenus, setOpenMenus] = useState<string[]>([]);

  // 현재 경로에 해당하는 메뉴를 자동으로 열기
  useEffect(() => {
    if (!pathname) return;

    // 현재 경로가 어떤 하위 메뉴에 속하는지 확인하고 해당 메뉴만 열기
    let activeMenuId = '';

    // 현재 경로에 해당하는 메뉴 ID 찾기
    menuStructure.forEach((menu) => {
      // 직접 경로가 있는 상위 메뉴인 경우
      if (menu.route) {
        const url = getRouteUrl(menu.route, locale);
        if (pathname === url) {
          activeMenuId = menu.id;
        }
      }

      // 하위 메뉴 확인
      menu.subMenus.forEach((subMenu) => {
        const url = getRouteUrl(subMenu.route, locale, subMenu.params);
        if (pathname === url) {
          activeMenuId = menu.id;
        }
      });
    });

    // 활성 메뉴가 있으면 해당 메뉴만 열기
    if (activeMenuId) {
      setOpenMenus([activeMenuId]);
    }
  }, [pathname, locale]);

  // 메뉴 토글 함수
  const toggleMenu = (menuId: string) => {
    if (openMenus.includes(menuId)) {
      // 이미 열려있으면 닫기
      setOpenMenus([]);
    } else {
      // 닫혀있으면 이 메뉴만 열기 (다른 메뉴는 모두 닫힘)
      setOpenMenus([menuId]);
    }
  };

  // 현재 메뉴가 활성화되었는지 확인
  const isActive = (route: string | null, params?: Record<string, string>) => {
    if (!route) return false;
    const url = getRouteUrl(route, locale, params);
    return pathname === url;
  };
  if (!mount) return null;

  return (
    <nav className="navigation" data-attr={`${locale}`}>
      <ul className="main-menu">
        {menuStructure.map((menu) => {
          const isMenuOpen = openMenus.includes(menu.id);
          const hasSubMenus = menu.subMenus.length > 0;
          const menuMetadata = menu.route
            ? getRouteMetadata(menu.route, dictionary, locale)
            : { name: dictionary.menu?.[menu.id] || menu.id };
          const isMenuActive = menu.route
            ? isActive(menu.route)
            : menu.subMenus.some((subMenu) =>
                isActive(subMenu.route, subMenu.params),
              );

          return (
            <li
              key={menu.id}
              className={cx('menu-item', { active: isMenuActive })}
            >
              {hasSubMenus ? (
                // 하위 메뉴가 있는 경우 토글 버튼으로 작동
                <div
                  className={cx('menu-toggle', { open: isMenuOpen })}
                  onClick={() => toggleMenu(menu.id)}
                >
                  <FontAwesomeIcon icon={menu.icon} className="menu-icon" />
                  <span className="menu-title">{menuMetadata.name}</span>
                  <FontAwesomeIcon
                    icon={faAngleDown}
                    className={cx('toggle-icon', { rotated: isMenuOpen })}
                  />
                </div>
              ) : (
                // 하위 메뉴가 없는 경우 직접 링크
                <Link
                  href={getRouteUrl(menu.route!, locale)}
                  className={cx('menu-link', { active: isActive(menu.route) })}
                >
                  <FontAwesomeIcon icon={menu.icon} className="menu-icon" />
                  <span className="menu-title">{menuMetadata.name}</span>
                </Link>
              )}

              {/* 하위 메뉴 렌더링 */}
              {hasSubMenus && (
                <ul className={cx('sub-menu', { open: isMenuOpen })}>
                  {menu.subMenus.map((subMenu) => {
                    const subMenuMetadata = getRouteMetadata(
                      subMenu.route,
                      dictionary,
                      locale,
                    );
                    const url = getRouteUrl(
                      subMenu.route,
                      locale,
                      subMenu.params,
                    );

                    return (
                      <li
                        key={subMenu.id}
                        className={cx('sub-menu-item', {
                          active: isActive(subMenu.route, subMenu.params),
                        })}
                      >
                        <Link href={url} className="sub-menu-link">
                          <FontAwesomeIcon
                            icon={faCaretRight}
                            className="sub-menu-icon"
                          />
                          {subMenu.customName || subMenuMetadata.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Navigation;
