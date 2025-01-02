import { routesData } from '@/data/routesData';

export interface iRouteParams {
  [key: string]: string | number;
}

export const generateRoutePath = (
  path?: string,
  params?: iRouteParams,
): string => {
  if (!path) {
    return '#'; // 기본 경로 처리
  }

  let resolvedPath = path; // path가 정의된 경우 복사
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, 'g'); // `{key}` 패턴 매칭
      resolvedPath = resolvedPath.replace(regex, value.toString());
    });
  }

  return resolvedPath;
};

export interface iRoute {
  path: string;
  name: string;
  desc: string;
}

export type RouteGroup = Record<string, iRoute>;
export type AdminRoutes = Record<string, RouteGroup>;

export const createLocalizedRoute = (
  locale: string,
  basePath: string,
  dictionary: any,
  routeKey: string,
): iRoute => ({
  path: `/${locale}${basePath}`,
  name: dictionary[routeKey]?.name || '',
  desc: dictionary[routeKey]?.desc || '',
});

// 라우트 데이터를 생성하는 함수
export const generateLocalizedRoutes = (
  locale: string,
  dictionary: any,
): AdminRoutes => {
  const localizedRoutes: AdminRoutes = {};

  Object.entries(routesData).forEach(([groupKey, routes]) => {
    localizedRoutes[groupKey] = {};
    Object.entries(routes).forEach(([routeKey, path]) => {
      const routeDictionary = dictionary.routes[groupKey]?.[routeKey];
      if (!routeDictionary) {
        console.warn(`Missing dictionary entry for ${groupKey}.${routeKey}`);
      }
      localizedRoutes[groupKey][routeKey] = createLocalizedRoute(
        locale,
        path as string,
        routeDictionary || { name: 'Unknown', desc: 'Unknown' },
        routeKey,
      );
    });
  });

  return localizedRoutes;
};
