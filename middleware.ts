import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import Negotiator from 'negotiator';
import { match } from '@formatjs/intl-localematcher';

const locales = ['en', 'ko', 'ja', 'zh']; // 지원 언어 목록
const DEFAULT_LANGUAGE = 'ko'; // 기본 언어 설정
const DEFAULT_ACCESS_REDIRECT = 'main';

function getLocale(request: NextRequest): string {
  const negotiatorHeaders = Object.fromEntries(request.headers.entries());
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();
  return match(languages, locales, DEFAULT_LANGUAGE);
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const locale = getLocale(request);

  const response = NextResponse.next();

  console.log(
    `============================ middleware start ========================================`,
  );

  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];

  if (!locales.includes(firstSegment)) {
    return NextResponse.redirect(
      new URL(`/${locale}/${DEFAULT_ACCESS_REDIRECT}`, request.nextUrl),
    );
  }

  // response.cookies.delete('ck_locale');
  response.cookies.set('ck_locale', firstSegment);

  console.log(
    `============================ middleware end ========================================`,
  );

  return response;
}

export const config = {
  // matcher: ['/((?!api/|_next/|_static/|_vercel|uploads/|editor/|favicon\\.ico|[\\w-]+\\.\\w+).*)'],
  matcher: [
    '/((?!api|_next/static|_next/image|_vercel|uploads/|editor/|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
