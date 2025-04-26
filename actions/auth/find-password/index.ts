'use server';

import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import {
  passwordSchema,
  PasswordType,
} from '@/actions/auth/find-password/schema';
import { getUserByEmail } from '@/actions/user/info';
import { User } from '@prisma/client';
import 'dayjs/locale/ko';
import { __ts, getDictionary } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';

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
  const missingFields = await __ts('common.form.missingFields', {}, language);

  const validatedFields = passwordSchema(dictionary.common.form).safeParse(
    data,
  );
  if (!validatedFields.success) {
    return {
      status: 'error',
      message: missingFields,
    };
  }

  const { email, password } = validatedFields.data;
  const hashedPassword = await bcrypt.hash(password, 10);

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
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword },
      });

      return { user };
    });

    const changedPassword = await __ts(
      'common.auth.register.changedPassword',
      {},
      language,
    );
    const resultComplete = await __ts(
      'common.form.resultComplete',
      { result: changedPassword },
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
