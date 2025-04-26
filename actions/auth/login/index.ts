'use server';
import { __ts, getDictionary } from '@/utils/get-dictionary';
import { loginSchema, LoginType } from './schema';
import { User } from '@prisma/client';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
import { getRouteUrl } from '@/utils/routes';
import { ckLocale } from '@/lib/cookie';
import { getUserByEmail } from '@/actions/user/info';
import { createAuthSession } from '@/lib/auth-utils';

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
  const missingFields = await __ts('common.form.missingFields', {}, language);

  const validatedFields = loginSchema(dictionary.common.form).safeParse(data);

  if (!validatedFields.success) {
    // console.log(validatedFields.error.format())
    return {
      status: 'error',
      message: missingFields,
    };
  }

  const { email } = validatedFields.data;

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

  try {
    const expiresAt = await createAuthSession(existingUser, { expiryDays: 30 });

    // revalidatePath(`/ko/main`, 'layout');

    const loginButton = await __ts(
      'common.auth.login.loginButton',
      {},
      language,
    );
    const resultComplete = await __ts(
      'common.form.resultComplete',
      { result: loginButton },
      language,
    );

    return {
      status: 'success',
      message: resultComplete,
      expiresAt: expiresAt.toISOString(), // 만료 시간 반환
    };
  } catch (error) {
    throw error;
  }
};
