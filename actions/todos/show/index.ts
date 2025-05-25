'use server';

import prisma from '@/lib/prisma';
import { __ts } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';
import { ITodosPart } from '@/types/todos';

export const showAction = async (uid: string): Promise<ITodosPart> => {
  const language = await ckLocale();
  const missingFields = await __ts(
    'common.form.notExist',
    { column: uid },
    language,
  );

  try {
    // throw Error('throw test')

    const todo = await prisma.todos.findUnique({
      where: { uid },
    });
    if (!todo) {
      throw Error(missingFields);
    }

    const rs = await prisma.todos.findUnique({
      where: { uid },
      include: {
        TodosComment: true, // 관련된 TodosComment도 함께 불러옵니다.
        TodosFile: true, // 관련된 TodosFile도 함께 불러옵니다.
        TodosOption: true,
      },
    });

    return rs as ITodosPart;
  } catch (error) {
    // console.error 는 터미널창 확인,
    // return error는 브라우저로 전달
    console.error('Error fetching', error);
    throw error;
  }

  // revalidatePath(`/auth/login`)
  // 해당 /URL에 있던 캐시를 삭제하고 다시 생성해주는 함수인데 페이지를 다시 로드해주는 기능도 있음,
  // 새로고침이 아니라 차이점만 바꿔주는 새로고침
};
