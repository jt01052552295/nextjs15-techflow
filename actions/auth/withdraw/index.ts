'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { withdrawSchema, WithdrawType } from '@/actions/auth/withdraw/schema';
import { getUserByEmail, getUserById } from '@/actions/user/info';
import { User } from '@prisma/client';
import { getDictionary } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';
import { formatMessage } from '@/lib/util';
import { logoutAction } from '../logout';
import { deleteNaverToken } from '@/lib/oauth/naver';

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

  const validatedFields = withdrawSchema(dictionary.common.form).safeParse(
    data,
  );
  if (!validatedFields.success) {
    return {
      status: 'error',
      message: dictionary.common.form.missingFields,
    };
  }

  const { id, email, nick, name, role, phone, isSignout } =
    validatedFields.data;

  const existingUserById = await getUserById(id);
  if (!existingUserById) {
    return {
      status: 'error',
      message: formatMessage(dictionary.common.form.notExist, { column: id }),
    };
  }

  const existingUser = await getUserByEmail(email);
  if (!existingUser) {
    return {
      status: 'error',
      message: formatMessage(dictionary.common.form.notExist, {
        column: email,
      }),
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
      }

      // 로그아웃 처리
      try {
        await logoutAction();
      } catch (logoutError) {
        console.error('로그아웃 처리 중 오류 발생:', logoutError);
        // 로그아웃 실패해도 탈퇴 처리는 완료된 상태이므로 성공 응답 유지
      }
    }

    return {
      status: 'success',
      message: formatMessage(dictionary.common.form.resultComplete, {
        result: dictionary.common.auth.register.withDrawLabel,
      }),
      data: result.user,
    };
  } catch (error) {
    throw error;
  }

  // revalidatePath(`/main`)
  // 해당 /URL에 있던 캐시를 삭제하고 다시 생성해주는 함수인데 페이지를 다시 로드해주는 기능도 있음,
  // 새로고침이 아니라 차이점만 바꿔주는 새로고침
};
