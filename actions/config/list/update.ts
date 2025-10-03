'use server';

import prisma from '@/lib/prisma';
import { __ts } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';

type UpdateTodoInput = {
  uid: string;
  CNFvalue?: string;
  CNFvalue_en?: string;
  CNFvalue_ja?: string;
  CNFvalue_zh?: string;
};

export const listUpdateAction = async (data: UpdateTodoInput) => {
  const language = await ckLocale();

  try {
    const { uid, CNFvalue, CNFvalue_en, CNFvalue_ja, CNFvalue_zh } = data;
    if (!uid) {
      const missing = await __ts('common.form.missingFields', {}, language);
      throw new Error(missing);
    }

    const exist = await prisma.config.findUnique({
      where: { uid },
    });
    if (!exist) throw new Error('NOT_FOUND');

    const updated = await prisma.config.update({
      where: { uid },
      data: {
        ...(CNFvalue !== undefined && { CNFvalue }),
        ...(CNFvalue_en !== undefined && { CNFvalue_en }),
        ...(CNFvalue_ja !== undefined && { CNFvalue_ja }),
        ...(CNFvalue_zh !== undefined && { CNFvalue_zh }),
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
