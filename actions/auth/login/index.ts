'use server';
import { getDictionary } from '@/utils/get-dictionary';
import type { LocaleType } from '@/constants/i18n';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';
import { loginSchema, LoginType } from './schema';
import { User } from '@prisma/client';
import { formatMessage } from '@/lib/util';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
import { getRouteUrl } from '@/utils/routes';
import { ckLocale } from '@/lib/cookie';

type ReturnType = {
  status: string;
  message: string;
  data?: User;
  twoFactor?: boolean;
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

  try {
    console.log('server action - ', email, password);

    return {
      status: 'success',
      message: formatMessage(dictionary.common.form.resultComplete, {
        result: dictionary.common.auth.login.loginButton,
      }),
    };
  } catch (error) {
    throw error;
  }
};
