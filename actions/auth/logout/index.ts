'use server';

import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { getRouteUrl } from '@/utils/routes';
import { ckLocale } from '@/lib/cookie';
import { getDictionary } from '@/utils/get-dictionary';

type LogoutResponse = {
  status: string;
  message: string;
};

/**
 * 사용자 로그아웃 처리를 위한 서버 액션
 * 세션 삭제 및 쿠키 제거를 수행합니다.
 */
export async function logoutAction(): Promise<LogoutResponse> {
  try {
    const language = await ckLocale();
    const dictionary = await getDictionary(language);

    const cookieStore = await cookies();

    const sessionToken = cookieStore.get('session_token')?.value;
    // 세션 토큰이 있으면 데이터베이스에서 세션 삭제
    if (sessionToken) {
      try {
        await prisma.session.delete({
          where: {
            sessionToken,
          },
        });
      } catch (error) {
        console.error('세션 삭제 오류:', error);
        // 세션이 이미 없어도 로그아웃은 계속 진행
      }
    }

    // 인증 관련 쿠키 모두 삭제
    cookieStore.delete('session_expires');
    cookieStore.delete('session_token');
    cookieStore.delete('auth_token');
    cookieStore.delete('naver_oauth_state');
    cookieStore.delete('oauth_data');

    return {
      status: 'success',
      message: dictionary.common.auth.logout.success,
    };
  } catch (error) {
    console.error('로그아웃 처리 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 로그아웃 후 로그인 페이지로 리다이렉트하는 서버 액션
 */
export async function logoutAndRedirectAction(): Promise<void> {
  await logoutAction();
  const language = await ckLocale();
  redirect(getRouteUrl('auth.login', language));
}
