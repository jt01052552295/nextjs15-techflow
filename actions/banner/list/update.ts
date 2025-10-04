'use server';

import prisma from '@/lib/prisma';
import { __ts } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';

type UpdateTodoInput = {
  uid: string;
  gubun?: string;
  title?: string;
};

export const listUpdateAction = async (data: UpdateTodoInput) => {
  const language = await ckLocale();

  try {
    const { uid, gubun, title } = data;
    if (!uid) {
      const missing = await __ts('common.form.missingFields', {}, language);
      throw new Error(missing);
    }

    if (gubun !== undefined && gubun.trim() === '') {
      throw new Error(await __ts('common.form.invalid', {}, language));
    }

    if (title !== undefined && title.trim() === '') {
      throw new Error(await __ts('common.form.invalid', {}, language));
    }

    const updated = await prisma.banner.update({
      where: { uid },
      data: {
        ...(gubun !== undefined && { gubun }),
        ...(title !== undefined && { title }),
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
