'use server';

import { accountSchema, AccountType } from '@/actions/auth/account/schema';
import { getUserByPhone } from '@/actions/user/info';
import { User } from '@prisma/client';
import 'dayjs/locale/ko';
import { __ts, getDictionary } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';

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
  const missingFields = await __ts('common.form.missingFields', {}, language);

  const validatedFields = accountSchema(dictionary.common.form).safeParse(data);
  if (!validatedFields.success) {
    return {
      status: 'error',
      message: missingFields,
    };
  }

  const { hp } = validatedFields.data;
  const existingUser = await getUserByPhone(hp);
  if (!existingUser) {
    const notExistHp = await __ts(
      'common.form.notExist',
      { column: hp },
      language,
    );

    return {
      status: 'error',
      message: notExistHp,
    };
  }

  try {
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
      data: existingUser,
    };
  } catch (error) {
    throw error;
  }

  // revalidatePath(`/main`)
  // 해당 /URL에 있던 캐시를 삭제하고 다시 생성해주는 함수인데 페이지를 다시 로드해주는 기능도 있음,
  // 새로고침이 아니라 차이점만 바꿔주는 새로고침
};
