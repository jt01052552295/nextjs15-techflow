'use server';

import prisma from '@/lib/prisma';

export const listSortAction = async (
  uid: string,
  direction: 'up' | 'down' | 'top' | 'bottom',
) => {
  const current = await prisma.todos.findUnique({ where: { uid } });
  if (!current) return { status: 'error', message: '항목을 찾을 수 없습니다.' };

  const currentOrder = current.sortOrder;

  let target: any = null;

  switch (direction) {
    case 'up':
      target = await prisma.todos.findFirst({
        where: { sortOrder: { gt: currentOrder } },
        orderBy: { sortOrder: 'asc' },
      });
      break;
    case 'down':
      target = await prisma.todos.findFirst({
        where: { sortOrder: { lt: currentOrder } },
        orderBy: { sortOrder: 'desc' },
      });
      break;
    case 'top':
      const max = await prisma.todos.aggregate({
        _max: { sortOrder: true },
      });
      await prisma.todos.update({
        where: { uid },
        data: { sortOrder: (max._max.sortOrder || 0) + 1 },
      });
      return { status: 'success', message: '최상단으로 이동했습니다.' };

    case 'bottom':
      const min = await prisma.todos.aggregate({
        _min: { sortOrder: true },
      });
      await prisma.todos.update({
        where: { uid },
        data: { sortOrder: (min._min.sortOrder || 0) - 1 },
      });
      return { status: 'success', message: '최하단으로 이동했습니다.' };
  }

  if (target) {
    // 순서 바꾸기 (swap)
    await prisma.$transaction([
      prisma.todos.update({
        where: { uid },
        data: { sortOrder: target.sortOrder },
      }),
      prisma.todos.update({
        where: { uid: target.uid },
        data: { sortOrder: currentOrder },
      }),
    ]);

    return { status: 'success', message: '정렬이 변경되었습니다.' };
  }

  return { status: 'error', message: '이동할 대상이 없습니다.' };
};
