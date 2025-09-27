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
  faCreditCard,
  faGears,
  faServer,
  faChartSimple,
  faAngleDown,
} from '@fortawesome/free-solid-svg-icons';

interface SubMenu {
  id: string;
  route: string;
}

interface MainMenu {
  id: string;
  icon: typeof faHome; // 또는 IconDefinition
  route: string | null;
  subMenus: SubMenu[];
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
    // {
    //   id: 'Todos',
    //   icon: faUser,
    //   route: 'todos.index',
    //   subMenus: [],
    // },
    {
      id: 'Practice',
      icon: faUser,
      route: 'practice.index',
      subMenus: [],
    },
    // {
    //   id: 'members',
    //   icon: faUser,
    //   route: null,
    //   subMenus: [
    //     { id: 'member-list', route: 'auth.login' }, // 회원 목록
    //     { id: 'company-list', route: 'auth.register' }, // 업체 목록
    //   ],
    // },
    // {
    //   id: 'devices',
    //   icon: faServer,
    //   route: null,
    //   subMenus: [
    //     { id: 'device-management', route: 'device.index' }, // 절감장치
    //   ],
    // },
    // {
    //   id: 'statistics',
    //   icon: faChartSimple,
    //   route: null,
    //   subMenus: [
    //     { id: 'power-statistics', route: 'estat.index' }, // 전력통계
    //   ],
    // },
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
        const url = getRouteUrl(subMenu.route, locale);
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
  const isActive = (route: string | null) => {
    if (!route) return false;
    const url = getRouteUrl(route, locale);
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
            : menu.subMenus.some((subMenu) => isActive(subMenu.route));

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
                    const url = getRouteUrl(subMenu.route, locale);

                    return (
                      <li
                        key={subMenu.id}
                        className={cx('sub-menu-item', {
                          active: isActive(subMenu.route),
                        })}
                      >
                        <Link href={url} className="sub-menu-link">
                          <FontAwesomeIcon
                            icon={faCaretRight}
                            className="sub-menu-icon"
                          />
                          {subMenuMetadata.name}
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
