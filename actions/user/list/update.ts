'use server';

import prisma from '@/lib/prisma';
import { __ts } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';

type UpdateTodoInput = {
  id: string;
  name?: string;
  email?: string;
};

export const listUpdateAction = async (data: UpdateTodoInput) => {
  const language = await ckLocale();

  try {
    const { id, name, email } = data;
    if (!id) {
      const missing = await __ts('common.form.missingFields', {}, language);
      throw new Error(missing);
    }

    if (name !== undefined && name.trim() === '') {
      throw new Error(await __ts('common.form.invalid', {}, language));
    }

    if (email !== undefined && !/^[\w-.]+@[\w-]+\.[a-z]{2,}$/i.test(email)) {
      throw new Error(await __ts('common.form.email', {}, language));
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
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
