'use server';

import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { registerSchema, RegisterType } from '@/actions/auth/register/schema';
import { getUserByEmail, getUserByPhone } from '@/actions/user/info';
import { User } from '@prisma/client';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
import { __ts, getDictionary } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';
import { createAuthSession } from '@/lib/auth-utils';

type ReturnType = {
  status: string;
  message: string;
  data?: User;
  twoFactor?: boolean;
  expiresAt?: string; // 만료 시간 추가
};

export const authRegisterAction = async (
  data: RegisterType,
  callbackUrl?: string | null,
): Promise<ReturnType> => {
  const language = await ckLocale();
  const dictionary = await getDictionary(language);
  const missingFields = await __ts('common.form.missingFields', {}, language);

  const validatedFields = registerSchema(dictionary.common.form).safeParse(
    data,
  );
  if (!validatedFields.success) {
    return {
      status: 'error',
      message: missingFields,
    };
  }

  const { email, password, name, hp } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    const alreadyUseEmail = await __ts(
      'common.form.alreadyUse',
      { column: email },
      language,
    );
    return {
      status: 'error',
      message: alreadyUseEmail,
    };
  }
  const existingPhone = await getUserByPhone(hp);
  if (existingPhone) {
    const alreadyUseHp = await __ts(
      'common.form.alreadyUse',
      { column: hp },
      language,
    );
    return {
      status: 'error',
      message: alreadyUseHp,
    };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. User 테이블에 사용자 정보 저장
      const user = await tx.user.create({
        data: {
          name,
          nick: name,
          email,
          phone: hp,
          password: hashedPassword,
          emailVerified: new Date(),
          signUpVerified: new Date(),
        },
      });

      return { user };
    });

    const expiresAt = await createAuthSession(result.user, { expiryDays: 30 });

    const registerButton = await __ts(
      'common.auth.register.registerButton',
      {},
      language,
    );
    const resultComplete = await __ts(
      'common.form.resultComplete',
      { result: registerButton },
      language,
    );

    return {
      status: 'success',
      message: resultComplete,
      data: result.user,
      expiresAt: expiresAt.toISOString(), // 만료 시간 반환
    };
  } catch (error) {
    throw error;
  }

  // revalidatePath(`/main`)
  // 해당 /URL에 있던 캐시를 삭제하고 다시 생성해주는 함수인데 페이지를 다시 로드해주는 기능도 있음,
  // 새로고침이 아니라 차이점만 바꿔주는 새로고침
};
