'use server';

import prisma from '@/lib/prisma';
import { ITodosPart } from '@/types/todos';
import { __ts } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';

type DeleteActionInput = {
  uid?: string;
  uids?: string[];
};

export const deleteAction = async (data: DeleteActionInput) => {
  const language = await ckLocale();

  try {
    // throw Error('throw test')
    const { uid, uids } = data;
    if (!uid && (!uids || !uids.length)) {
      const missingFields = await __ts(
        'common.form.missingFields',
        {},
        language,
      );
      throw Error(missingFields);
    }

    if (uids && uids.length > 0) {
      // 복수 삭제 처리
      const rs = await prisma.$transaction(async (tx) => {
        await tx.todosFile.deleteMany({
          where: { todoId: { in: uids } },
        });

        await tx.todosComment.deleteMany({
          where: { todoId: { in: uids } },
        });
        await tx.todosOption.deleteMany({
          where: { todoId: { in: uids } },
        });

        const result = await tx.todos.updateMany({
          where: { uid: { in: uids } },
          data: { isUse: false, isVisible: false },
        });

        return result;
      });

      const delete_success = await __ts('common.delete_success', {}, language);
      return { status: 'success', message: delete_success, data: rs };
    }

    // 단건 삭제 처리
    if (!uid) {
      const missingFields = await __ts(
        'common.form.missingFields',
        {},
        language,
      );
      throw Error(missingFields);
    }

    const todo = await prisma.todos.findUnique({ where: { uid } });
    if (!todo) {
      const notExistuid = await __ts(
        'common.form.notExist',
        { column: uid },
        language,
      );
      throw Error(notExistuid);
    }

    const rs = await prisma.$transaction(async (tx) => {
      await tx.todosFile.deleteMany({ where: { todoId: todo.uid } });
      await tx.todosComment.deleteMany({ where: { todoId: todo.uid } });
      await tx.todosOption.deleteMany({ where: { todoId: todo.uid } });

      return await tx.todos.update({
        where: { uid: todo.uid },
        data: { isUse: false, isVisible: false },
      });
    });

    const delete_success = await __ts('common.delete_success', {}, language);
    return { status: 'success', message: delete_success, data: rs };
  } catch (error) {
    // console.error 는 터미널창 확인,
    // return error는 브라우저로 전달
    const delete_failed = await __ts('common.delete_failed', {}, language);

    console.error(error);
    return {
      status: 'error',
      message: delete_failed,
    };
  }
};
