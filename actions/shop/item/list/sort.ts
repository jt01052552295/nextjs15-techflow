'use server';

import prisma from '@/lib/prisma';
import { __ts } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';

export const listSortAction = async (
  uid: string,
  direction: 'up' | 'down' | 'top' | 'bottom',
) => {
  const language = await ckLocale();

  const msgerror = await __ts('common.sortAction.error', {}, language);
  const msgtoTop = await __ts('common.sortAction.toTop', {}, language);
  const msgtoBottom = await __ts('common.sortAction.toBottom', {}, language);
  const msgchange = await __ts('common.sortAction.change', {}, language);
  const msgnoData = await __ts('common.sortAction.noData', {}, language);

  const current = await prisma.shopItem.findUnique({ where: { uid } });
  if (!current) return { status: 'error', message: msgerror };

  const currentOrder = current.sortOrder;

  let target: any = null;

  switch (direction) {
    case 'up':
      target = await prisma.shopItem.findFirst({
        where: { sortOrder: { gt: currentOrder } },
        orderBy: { sortOrder: 'asc' },
      });
      break;
    case 'down':
      target = await prisma.shopItem.findFirst({
        where: { sortOrder: { lt: currentOrder } },
        orderBy: { sortOrder: 'desc' },
      });
      break;
    case 'top':
      const max = await prisma.shopItem.aggregate({
        _max: { sortOrder: true },
      });
      await prisma.shopItem.update({
        where: { uid },
        data: { sortOrder: (max._max.sortOrder || 0) + 1 },
      });
      return { status: 'success', message: msgtoTop };

    case 'bottom':
      const min = await prisma.shopItem.aggregate({
        _min: { sortOrder: true },
      });
      await prisma.shopItem.update({
        where: { uid },
        data: { sortOrder: (min._min.sortOrder || 0) - 1 },
      });
      return { status: 'success', message: msgtoBottom };
  }

  if (target) {
    // 순서 바꾸기 (swap)
    await prisma.$transaction([
      prisma.shopItem.update({
        where: { uid },
        data: { sortOrder: target.sortOrder },
      }),
      prisma.shopItem.update({
        where: { uid: target.uid },
        data: { sortOrder: currentOrder },
      }),
    ]);

    return { status: 'success', message: msgchange };
  }

  return { status: 'error', message: msgnoData };
};
