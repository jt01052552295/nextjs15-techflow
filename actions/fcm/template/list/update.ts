'use server';

import prisma from '@/lib/prisma';
import { __ts } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';

type UpdateTodoInput = {
  uid: string;
  type?: string;
  activity?: string;
};

export const listUpdateAction = async (data: UpdateTodoInput) => {
  const language = await ckLocale();

  try {
    const { uid, type, activity } = data;
    if (!uid) {
      const missing = await __ts('common.form.missingFields', {}, language);
      throw new Error(missing);
    }

    if (type !== undefined && type.trim() === '') {
      throw new Error(await __ts('common.form.invalid', {}, language));
    }

    if (activity !== undefined && activity.trim() === '') {
      throw new Error(await __ts('common.form.invalid', {}, language));
    }

    const updated = await prisma.fcmToken.update({
      where: { uid },
      data: {
        ...(type !== undefined && { type }),
        ...(activity !== undefined && { activity }),
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
