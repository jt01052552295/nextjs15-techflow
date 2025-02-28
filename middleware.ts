import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { I18N_CONFIG } from '@/constants/i18n';
import type { LocaleType } from '@/constants/i18n';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathnameSegments = pathname.split('/').filter(Boolean);
  const firstSegment = pathnameSegments[0] as LocaleType | undefined;

  // 지원되는 언어가 아닌 경우 기본 언어로 리다이렉트
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
