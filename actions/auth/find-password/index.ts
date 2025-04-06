'use server';

import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import {
  passwordSchema,
  PasswordType,
} from '@/actions/auth/find-password/schema';
import { getUserById, getUserByEmail } from '@/actions/user/info';
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

export const findNewPasswordAction = async (
  data: PasswordType,
): Promise<ReturnType> => {
  const language = await ckLocale();
  const dictionary = await getDictionary(language);

  const validatedFields = passwordSchema(dictionary.common.form).safeParse(
    data,
  );
  if (!validatedFields.success) {
    return {
      status: 'error',
      message: dictionary.common.form.missingFields,
    };
  }

  const { email, emailCode, password, re_password } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

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
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword },
      });

      return { user };
    });

    return {
      status: 'success',
      message: formatMessage(dictionary.common.form.resultComplete, {
        result: dictionary.common.auth.register.changedPassword,
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
