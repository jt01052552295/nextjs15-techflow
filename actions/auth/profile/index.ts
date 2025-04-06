'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { profileSchema, ProfileType } from '@/actions/auth/profile/schema';
import { getUserByEmail, getUserById } from '@/actions/user/info';
import { User } from '@prisma/client';
import { getDictionary } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';
import { formatMessage } from '@/lib/util';

type ReturnType = {
  status: string;
  message: string;
  data?: User;
  twoFactor?: boolean;
  token?: string;
};

export const authProfileAction = async (
  data: ProfileType,
  callbackUrl?: string | null,
): Promise<ReturnType> => {
  const language = await ckLocale();
  const dictionary = await getDictionary(language);

  const validatedFields = profileSchema(dictionary.common.form).safeParse(data);
  if (!validatedFields.success) {
    return {
      status: 'error',
      message: dictionary.common.form.missingFields,
    };
  }

  const { id, email, nick, name, role, phone, isUse, isVisible } =
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

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: existingUser.id },
        data: {
          nick,
          name,
          role,
          phone,
          isUse: isUse ? true : false,
          isVisible: isVisible ? true : false,
        },
      });

      return { user };
    });

    return {
      status: 'success',
      message: formatMessage(dictionary.common.form.resultComplete, {
        result: dictionary.common.auth.register.changedProfile,
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
