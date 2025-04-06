'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { accountSchema, AccountType } from '@/actions/auth/account/schema';
import { getUserByPhone } from '@/actions/user/info';
import { User } from '@prisma/client';

import 'dayjs/locale/ko';
import { getDictionary } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';
import { formatMessage } from '@/lib/util';

type ReturnType = {
  status: string;
  message: string;
  data?: User;
};

export const findAccountAction = async (
  data: AccountType,
): Promise<ReturnType> => {
  const language = await ckLocale();
  const dictionary = await getDictionary(language);

  const validatedFields = accountSchema(dictionary.common.form).safeParse(data);
  if (!validatedFields.success) {
    return {
      status: 'error',
      message: dictionary.common.form.missingFields,
    };
  }

  const { hp } = validatedFields.data;
  const existingUser = await getUserByPhone(hp);
  if (!existingUser) {
    return {
      status: 'error',
      message: formatMessage(dictionary.common.form.notExist, {
        column: hp,
      }),
    };
  }

  try {
    return {
      status: 'success',
      message: formatMessage(dictionary.common.form.resultComplete, {
        result: dictionary.common.auth.register.changedPassword,
      }),
      data: existingUser,
    };
  } catch (error) {
    throw error;
  }

  // revalidatePath(`/main`)
  // 해당 /URL에 있던 캐시를 삭제하고 다시 생성해주는 함수인데 페이지를 다시 로드해주는 기능도 있음,
  // 새로고침이 아니라 차이점만 바꿔주는 새로고침
};
