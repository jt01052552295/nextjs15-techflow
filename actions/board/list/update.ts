'use server';

import prisma from '@/lib/prisma';
import { __ts } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';

type UpdateTodoInput = {
  uid: string;
  bdName?: string;
  bdTable?: string;
};

export const listUpdateAction = async (data: UpdateTodoInput) => {
  const language = await ckLocale();

  try {
    const { uid, bdName, bdTable } = data;
    if (!uid) {
      const missing = await __ts('common.form.missingFields', {}, language);
      throw new Error(missing);
    }

    if (bdName !== undefined && bdName.trim() === '') {
      throw new Error(await __ts('common.form.invalid', {}, language));
    }
    if (bdTable !== undefined && bdTable.trim() === '') {
      throw new Error(await __ts('common.form.invalid', {}, language));
    }

    const updated = await prisma.board.update({
      where: { uid },
      data: {
        ...(bdName !== undefined && { bdName }),
        ...(bdTable !== undefined && { bdTable }),
      },
    });

    const msg = await __ts('common.save_success', {}, language);

    return {
      status: 'success',
      message: msg,
      data: updated,
    };
  } catch (error) {
    console.error(error);
    const msg = await __ts('common.save_failed', {}, language);
    return {
      status: 'error',
      message: msg,
    };
  }
};
