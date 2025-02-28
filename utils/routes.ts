/* eslint-disable @typescript-eslint/no-explicit-any */
import { routesData } from '@/data/routesData';
import type { RoutePattern, RouteMetadata } from '@/types/routes';

export function getRoutePattern(path: string): RoutePattern {
  const segments = path.split('.');
  let current: any = routesData;

  try {
    for (const segment of segments) {
      if (current && segment in current) {
        current = current[segment];
      } else {
        throw new Error(`Invalid route path: ${path}`);
      }
    }

    if (typeof current !== 'string') {
      throw new Error(`Invalid route pattern for path: ${path}`);
    }

    return current;
  } catch (error) {
    console.error('Route resolution error:', error);
    return '/'; // 기본 경로로 폴백
  }
}

export function getRouteUrl(
  path: string,
  locale: string,
  params?: Record<string, string>,
): string {
  const pattern = getRoutePattern(path);
  let url = `/${locale}${pattern}`;

  if (params) {
    url = url.replace(/{(\w+)}/g, (_, key) => params[key] || '');
  }

  return url;
}

export function resolveRoute(
  pattern: RoutePattern,
  params?: Record<string, string>,
): string {
  if (!params) return pattern;
  return pattern.replace(/{(\w+)}/g, (_, key) => params[key] || '');
}

export function getRouteMetadata(
  path: string,
  dictionary: any,
  locale: string,
): RouteMetadata & { url: string } {
  const segments = path.split('.');
  let current = dictionary.routes;

  for (const segment of segments) {
    current = current[segment];
  }

  return {
    ...current,
    url: `/${locale}${resolveRoute(getRoutePattern(path))}`,
  };
}
