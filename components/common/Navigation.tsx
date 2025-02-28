'use client';
import { useLanguage } from '@/components/context/LanguageContext';
import Link from 'next/link';
import { getRouteMetadata, getRouteUrl } from '@/utils/routes';
import { formatMessage } from '@/lib/util';

const Navigation = () => {
  const { dictionary, locale } = useLanguage();

  // console.log(dictionary.common.greeting);

  const menuItems = [
    'main.index', // 대시보드
    'auth.login', // 회원 목록
    'auth.register', // 업체 목록
    'device.index', // 절감장치
    'estat.index', // 전력통계
  ];

  return (
    <nav data-attr={`${locale}`}>
      <ul>
        <li>{formatMessage(dictionary.common.greeting, { name: 'test' })}</li>
      </ul>
      <ul>
        {menuItems.map((path) => {
          const metadata = getRouteMetadata(path, dictionary, locale);
          const url = getRouteUrl(path, locale);

          return (
            <li key={path}>
              <Link href={url}>
                {metadata.name}
                {metadata.desc && (
                  <small className="menu-description">{metadata.desc}</small>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Navigation;
