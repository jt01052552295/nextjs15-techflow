'use server';

import prisma from '@/lib/prisma';
import { __ts } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';

type UpdateTodoInput = {
  uid: string;
  name?: string;
  bizNo?: string;
};

export const listUpdateAction = async (data: UpdateTodoInput) => {
  const language = await ckLocale();

  try {
    const { uid, name, bizNo } = data;
    if (!uid) {
      const missing = await __ts('common.form.missingFields', {}, language);
      throw new Error(missing);
    }

    if (name !== undefined && name.trim() === '') {
      throw new Error(await __ts('common.form.invalid', {}, language));
    }
    if (bizNo !== undefined && bizNo.trim() === '') {
      throw new Error(await __ts('common.form.invalid', {}, language));
    }

    const updated = await prisma.company.update({
      where: { uid },
      data: {
        ...(name !== undefined && { name }),
        ...(bizNo !== undefined && { bizNo }),
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
