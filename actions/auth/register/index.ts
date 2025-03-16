'use server';

import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { registerSchema, RegisterType } from '@/actions/auth/register/schema';
import { getUserByEmail, getUserByPhone } from '@/actions/user/info';
import { User } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
import { getDictionary } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';
import { formatMessage } from '@/lib/util';
import { sign } from 'jsonwebtoken';

type ReturnType = {
  status: string;
  message: string;
  data?: User;
  twoFactor?: boolean;
  token?: string;
};

export const authRegisterAction = async (
  data: RegisterType,
  callbackUrl?: string | null,
): Promise<ReturnType> => {
  const language = await ckLocale();
  const dictionary = await getDictionary(language);

  const validatedFields = registerSchema(dictionary.common.form).safeParse(
    data,
  );
  if (!validatedFields.success) {
    return {
      status: 'error',
      message: dictionary.common.form.missingFields,
    };
  }

  const { email, password, name, hp } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return {
      status: 'error',
      message: formatMessage(dictionary.common.form.alreadyUse, {
        column: email,
      }),
    };
  }
  const existingPhone = await getUserByPhone(hp);
  if (existingPhone) {
    return {
      status: 'error',
      message: formatMessage(dictionary.common.form.alreadyUse, {
        column: hp,
      }),
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

      // 3. 세션 생성
      const sessionToken = uuidv4();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30일 후 만료

      await tx.session.create({
        data: {
          sessionToken,
          userId: user.id,
          expires: expiresAt,
        },
      });

      return { user, sessionToken, expiresAt };
    });

    // 4. JWT 토큰 생성
    const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret';
    const token = sign(
      {
        userId: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
      },
      jwtSecret,
      { expiresIn: '30d' },
    );

    // 5. 쿠키에 세션 토큰 저장
    const cookieStore = await cookies();
    cookieStore.set('session_token', result.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60, // 30일
      path: '/',
    });
    // 6. 쿠키에 JWT 토큰 저장
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60, // 30일
      path: '/',
    });

    return {
      status: 'success',
      message: formatMessage(dictionary.common.form.resultComplete, {
        result: dictionary.common.auth.register.registerButton,
      }),
      data: result.user,
      token: token, // 클라이언트에서 필요하다면 토큰 반환
    };
  } catch (error) {
    throw error;
  }

  // revalidatePath(`/main`)
  // 해당 /URL에 있던 캐시를 삭제하고 다시 생성해주는 함수인데 페이지를 다시 로드해주는 기능도 있음,
  // 새로고침이 아니라 차이점만 바꿔주는 새로고침
};
