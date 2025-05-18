'use server';

import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import type { ITodosFilterType } from '@/types/todos';

export const listAction = async (
  page: number = 1,
  filters?: ITodosFilterType,
) => {
  try {
    const take = 30;
    const skip = (page - 1) * take;

    // 조건 조립
    const where: any = { isUse: true, isVisible: true };

    if (filters?.name) {
      where.name = { contains: filters.name };
    }

    if (filters?.email) {
      where.email = { contains: filters.email };
    }

    if (filters?.dateType && (filters?.startDate || filters?.endDate)) {
      where[filters.dateType] = {
        ...(filters.startDate && { gte: new Date(filters.startDate) }),
        ...(filters.endDate && { lte: new Date(filters.endDate) }),
      };
    }

    const allowedSortFields = [
      'sortOrder',
      'name',
      'email',
      'createdAt',
      'updatedAt',
    ] as const;
    const orderField = filters?.orderBy;
    const orderDirection: 'asc' | 'desc' =
      filters?.order === 'asc' ? 'asc' : 'desc';

    let orderBy: Prisma.TodosOrderByWithRelationInput[] = [
      { sortOrder: 'desc' },
      { idx: 'desc' },
    ];

    if (orderField && allowedSortFields.includes(orderField)) {
      orderBy = [{ [orderField]: orderDirection }];
    }

    const queryOptions = {
      where,
      take,
      skip,
      orderBy,
      include: {
        TodosComment: true,
        TodosFile: true,
        TodosOption: true,
      },
    };

    const items = await prisma.todos.findMany(queryOptions);
    const totalCount = await prisma.todos.count({ where });
    const totalPages = Math.ceil(totalCount / take);

    console.log('[listAction]', {
      page,
      skip,
      take,
      orderBy,
      filters,
    });

    return {
      items,
      page,
      totalPages,
      hasMore: page < totalPages,
      totalCount,
    };
  } catch (error) {
    console.error('listAction 오류:', error);
    return undefined;
  }
};
