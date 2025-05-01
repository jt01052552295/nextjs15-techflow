'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { withdrawSchema, WithdrawType } from '@/actions/auth/withdraw/schema';
import { getUserByEmail, getUserById } from '@/actions/user/info';
import { User } from '@prisma/client';
import { __ts, getDictionary } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';
import { logoutAction } from '../logout';
import { deleteNaverToken } from '@/lib/oauth/naver';
import { deleteKakaoToken } from '@/lib/oauth/kakao';
import { deleteGoogleToken } from '@/lib/oauth/google';
import { deleteGithubToken } from '@/lib/oauth/github';

type ReturnType = {
  status: string;
  message: string;
  data?: User;
  twoFactor?: boolean;
  token?: string;
};

export const autWithdrawAction = async (
  data: WithdrawType,
  callbackUrl?: string | null,
): Promise<ReturnType> => {
  const language = await ckLocale();
  const dictionary = await getDictionary(language);
  const missingFields = await __ts('common.form.missingFields', {}, language);

  const validatedFields = withdrawSchema(dictionary.common.form).safeParse(
    data,
  );
  if (!validatedFields.success) {
    return {
      status: 'error',
      message: missingFields,
    };
  }

  const { id, email, isSignout } = validatedFields.data;

  const existingUserById = await getUserById(id);
  if (!existingUserById) {
    const notExistId = await __ts(
      'common.form.notExist',
      { column: id },
      language,
    );
    return {
      status: 'error',
      message: notExistId,
    };
  }

  const existingUser = await getUserByEmail(email);
  if (!existingUser) {
    const notExistEmail = await __ts(
      'common.form.notExist',
      { column: email },
      language,
    );
    return {
      status: 'error',
      message: notExistEmail,
    };
  }

  const existingAccount = await prisma.account.findFirst({
    where: {
      userId: existingUser.id,
    },
  });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: existingUser.id },
        data: {
          isSignout: isSignout ? true : false,
        },
      });

      return { user };
    });

    if (isSignout) {
      if (
        existingAccount?.provider === 'naver' &&
        existingAccount.access_token
      ) {
        try {
          const naverTokenResult = await deleteNaverToken(
            existingAccount.access_token,
          );

          if (naverTokenResult.success) {
            await prisma.account.delete({
              where: { idx: existingAccount.idx },
            });
          } else {
            console.error('네이버 토큰 삭제 실패:', naverTokenResult.message);
          }
        } catch (naverError) {
          console.error('네이버 토큰 삭제 중 예외 발생:', naverError);
        }
      } else if (
        existingAccount?.provider === 'kakao' &&
        existingAccount.access_token
      ) {
        try {
          const kakaoTokenResult = await deleteKakaoToken(
            existingAccount.access_token,
          );

          if (kakaoTokenResult.success) {
            await prisma.account.delete({
              where: { idx: existingAccount.idx },
            });
          } else {
            console.error('카카오오 토큰 삭제 실패:', kakaoTokenResult.message);
          }
        } catch (naverError) {
          console.error('카카오 토큰 삭제 중 예외 발생:', naverError);
        }
      } else if (
        existingAccount?.provider === 'google' &&
        existingAccount.access_token
      ) {
        try {
          const googleTokenResult = await deleteGoogleToken(
            existingAccount.access_token,
          );

          console.log(googleTokenResult);

          if (googleTokenResult.success) {
            await prisma.account.delete({
              where: { idx: existingAccount.idx },
            });
          } else {
            console.error('구글 토큰 삭제 실패:', googleTokenResult.message);
          }
        } catch (naverError) {
          console.error('구글 토큰 삭제 중 예외 발생:', naverError);
        }
      } else if (
        existingAccount?.provider === 'github' &&
        existingAccount.access_token
      ) {
        try {
          const githubTokenResult = await deleteGithubToken(
            existingAccount.access_token,
          );

          console.log(githubTokenResult);

          if (githubTokenResult.success) {
            await prisma.account.delete({
              where: { idx: existingAccount.idx },
            });
          } else {
            console.error('github 토큰 삭제 실패:', githubTokenResult.message);
          }
        } catch (naverError) {
          console.error('github 토큰 삭제 중 예외 발생:', naverError);
        }
      }

      // 로그아웃 처리
      try {
        await logoutAction();
      } catch (logoutError) {
        console.error('로그아웃 처리 중 오류 발생:', logoutError);
        // 로그아웃 실패해도 탈퇴 처리는 완료된 상태이므로 성공 응답 유지
      }
    }

    const withDrawLabel = await __ts(
      'common.auth.register.withDrawLabel',
      {},
      language,
    );
    const resultComplete = await __ts(
      'common.form.resultComplete',
      { result: withDrawLabel },
      language,
    );

    return {
      status: 'success',
      message: resultComplete,
      data: result.user,
    };
  } catch (error) {
    throw error;
  }

  // revalidatePath(`/main`)
  // 해당 /URL에 있던 캐시를 삭제하고 다시 생성해주는 함수인데 페이지를 다시 로드해주는 기능도 있음,
  // 새로고침이 아니라 차이점만 바꿔주는 새로고침
};
