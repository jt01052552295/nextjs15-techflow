'use server';
import { getDictionary } from '@/utils/get-dictionary';
import type { LocaleType } from '@/constants/i18n';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';
import { loginSchema, LoginType } from './schema';
import { User } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { formatMessage } from '@/lib/util';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
import { getRouteUrl } from '@/utils/routes';
import { ckLocale } from '@/lib/cookie';
import { getUserByEmail } from '@/actions/user/info';
import { sign } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

type ReturnType = {
  status: string;
  message: string;
  data?: User;
  twoFactor?: boolean;
  expiresAt?: string; // 만료 시간 추가
};

export const authLoginAction = async (
  data: LoginType,
  callbackUrl?: string | null,
): Promise<ReturnType> => {
  const language = await ckLocale();
  const dictionary = await getDictionary(language);

  const validatedFields = loginSchema(dictionary.common.form).safeParse(data);

  if (!validatedFields.success) {
    // console.log(validatedFields.error.format())
    return {
      status: 'error',
      message: dictionary.common.form.missingFields,
    };
  }

  const { email, password } = validatedFields.data;

  const existingUser = await getUserByEmail(email);
  if (!existingUser) {
    return {
      status: 'error',
      message: formatMessage(dictionary.common.form.notExist, {
        column: email,
      }),
    };
  }

  try {
    // 3. 세션 생성
    const sessionToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30일 후 만료

    await prisma.session.create({
      data: {
        sessionToken,
        userId: existingUser.id,
        expires: expiresAt,
      },
    });

    // 4. JWT 토큰 생성
    const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret';
    const token = sign(
      {
        userId: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        role: existingUser.role,
      },
      jwtSecret,
      { expiresIn: '30d' },
    );

    // 5. 쿠키에 세션 토큰 저장
    const cookieStore = await cookies();
    cookieStore.set('session_token', sessionToken, {
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

    // 7. 만료 시간을 클라이언트 쿠키에도 저장 (클라이언트에서 접근 가능하도록)
    cookieStore.set('session_expires', expiresAt.toISOString(), {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60, // 30일
      path: '/',
    });

    // revalidatePath(`/ko/main`, 'layout');

    return {
      status: 'success',
      message: formatMessage(dictionary.common.form.resultComplete, {
        result: dictionary.common.auth.login.loginButton,
      }),
      expiresAt: expiresAt.toISOString(), // 만료 시간 반환
    };
  } catch (error) {
    throw error;
  }
};
