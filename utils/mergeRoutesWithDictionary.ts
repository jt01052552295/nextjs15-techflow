import { routesData } from '@/data/routesData';
import { useLanguage } from '@/components/context/LanguageContext';

export const mergeRoutesWithDictionary = () => {
  const { dictionary } = useLanguage(); // 언어 데이터 가져오기
  const mergedRoutes: Array<{
    id: string;
    group: string;
    key: string;
    path: string;
    name: string;
    desc: string;
  }> = [];

  Object.entries(routesData).forEach(([groupKey, groupRoutes]) => {
    Object.entries(groupRoutes).forEach(([routeKey, path]) => {
      const name = dictionary.routes[groupKey]?.[routeKey]?.name || '';
      const desc = dictionary.routes[groupKey]?.[routeKey]?.desc || '';

      mergedRoutes.push({
        id: `${groupKey}-${routeKey}`, // 고유 ID 생성
        group: groupKey,
        key: routeKey,
        path,
        name,
        desc,
      });
    });
  });

  return mergedRoutes;
};
