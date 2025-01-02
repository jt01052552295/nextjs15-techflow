'use client';

import { useRoutes } from '@/components/context/RoutesContext';
import { useLanguage } from '@/components/context/LanguageContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { mergeRoutesWithDictionary } from '@/utils/mergeRoutesWithDictionary';
import { generateRoutePath } from '@/utils/routes';
import { formatMessage } from '@/lib/util';

const Navigation = () => {
  const routes = useRoutes();
  const { dictionary, locale } = useLanguage();
  const pathname = usePathname();

  const mergeRoutes = mergeRoutesWithDictionary(); // 병합된 데이터 가져오기

  // console.log(routes);

  return (
    <nav>
      <ul>
        <li>{formatMessage(dictionary.common.greeting, { name: 'world' })}</li>
        <li>{generateRoutePath(routes.todo1.index.path)}</li>
        <li>{generateRoutePath(routes.todo1.edit.path, { id: 10 })}</li>
        {mergeRoutes.map(({ id, path, name }) => (
          <li key={id} className={pathname === path ? 'active' : ''}>
            {name} : {path}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
