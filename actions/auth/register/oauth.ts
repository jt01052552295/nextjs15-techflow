'use server';

import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { __ts } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';

type ReturnType = {
  status: string;
  message: string;
  userData?: any;
};

export const getOauthDataAction = async (): Promise<ReturnType> => {
  try {
    const language = await ckLocale();
    const cookieStore = await cookies();
    const oauthToken = cookieStore.get('oauth_data')?.value;

    const noOauth = await __ts('common.auth.error.noOauth', {}, language);

    if (!oauthToken) {
      return {
        status: 'error',
        message: noOauth,
      };
    }

    const jwtSecret = process.env.JWT_SECRET || '';
    const userData = verify(oauthToken, jwtSecret);

    return {
      status: 'success',
      message: '',
      userData: userData,
    };
  } catch (error) {
    throw error;
  }

  // revalidatePath(`/main`)
  // 해당 /URL에 있던 캐시를 삭제하고 다시 생성해주는 함수인데 페이지를 다시 로드해주는 기능도 있음,
  // 새로고침이 아니라 차이점만 바꿔주는 새로고침
};
