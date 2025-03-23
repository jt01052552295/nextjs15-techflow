import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { I18N_CONFIG } from '@/constants/i18n';
import type { LocaleType } from '@/constants/i18n';
import { getRouteUrl } from '@/utils/routes';

const PUBLIC_PATHS = ['/auth'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathnameSegments = pathname.split('/').filter(Boolean);
  const firstSegment = pathnameSegments[0] as LocaleType | undefined;

  // 루트 경로('/')로 접근한 경우 기본 언어의 메인 페이지로 리다이렉트
  if (pathname === '/') {
    const savedLocale = request.cookies.get('NEXT_LOCALE')?.value;
    const locale =
      savedLocale && I18N_CONFIG.locales.includes(savedLocale as LocaleType)
        ? savedLocale
        : I18N_CONFIG.defaultLocale;

    const mainUrl = getRouteUrl('main.index', locale as LocaleType);
    return NextResponse.redirect(new URL(mainUrl, request.url));
  }

  // 1. 언어 처리: 지원되는 언어가 아닌 경우 기본 언어로 리다이렉트
  if (!firstSegment || !I18N_CONFIG.locales.includes(firstSegment)) {
    // 쿠키에서 이전에 선택한 언어 확인
    const savedLocale = request.cookies.get('NEXT_LOCALE')?.value;
    const locale =
      savedLocale && I18N_CONFIG.locales.includes(savedLocale as LocaleType)
        ? savedLocale
        : I18N_CONFIG.defaultLocale;

    return NextResponse.redirect(
      new URL(`/${locale}${pathname === '/' ? '' : pathname}`, request.url),
    );
  }

  // 언어 코드만 있는 경로(예: /ko)는 메인 페이지로 리다이렉트
  if (pathnameSegments.length === 1) {
    const mainUrl = getRouteUrl('main.index', firstSegment);
    return NextResponse.redirect(new URL(mainUrl, request.url));
  }

  // 2. 인증 처리: 언어 코드 이후의 경로 추출
  const pathWithoutLocale = '/' + pathnameSegments.slice(1).join('/');

  // 인증 토큰 확인
  const authToken = request.cookies.get('auth_token')?.value;

  // 3. 이미 로그인한 사용자가 /auth 경로에 접근하는 경우 메인 페이지로 리다이렉트
  if (authToken && pathWithoutLocale.startsWith('/auth')) {
    const mainUrl = getRouteUrl('main.index', firstSegment);
    return NextResponse.redirect(new URL(`${mainUrl}`, request.url));
  }

  // 4. 공개 경로인 경우 인증 확인 없이 통과
  if (
    PUBLIC_PATHS.some(
      (publicPath) =>
        pathWithoutLocale === publicPath ||
        pathWithoutLocale.startsWith(publicPath + '/'),
    )
  ) {
    const response = NextResponse.next();
    response.cookies.set('NEXT_LOCALE', firstSegment);
    return response;
  }

  // 4. 공개 경로인 경우 인증 확인 없이 통과
  // 인증 토큰이 없는 경우 로그인 페이지로 리다이렉트
  if (!authToken) {
    const loginUrl = getRouteUrl('auth.login', firstSegment);
    return NextResponse.redirect(new URL(`${loginUrl}`, request.url));
  }

  // 인증된 사용자는 통과
  const response = NextResponse.next();
  response.cookies.set('NEXT_LOCALE', firstSegment);

  return response;
}

export const config = {
  // matcher: ['/((?!api/|_next/|_static/|_vercel|uploads/|editor/|favicon\\.ico|[\\w-]+\\.\\w+).*)'],
  matcher: [
    '/((?!api|_next/static|_next/image|_vercel|uploads/|editor/|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
