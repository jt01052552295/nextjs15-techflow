import prisma from '@/lib/prisma';
import type { IBoard } from '@/types/board';
import { Prisma } from '@prisma/client';

/**
 * 활성화된 사용자 목록을 가져옵니다
 * @param limit 최대 사용자 수 (기본값: 100)
 * @returns 사용자 목록 (id, name, email)
 */
export async function getActiveBoard(limit?: number): Promise<IBoard[]> {
  try {
    const list = await prisma.board.findMany({
      where: {
        // isUse: true,
        // isVisible: true,
      },
      orderBy: {
        sortOrder: Prisma.SortOrder.desc,
      },
      ...(limit ? { take: limit } : {}),
    });

    console.log(`Found ${list.length} boards with isUse=true`);
    return list;
  } catch (error) {
    console.error('Error fetching boards:', error);
    return [];
  }
}

/**
 * @param bdTable 테이블
 * @returns 게시판정보 또는 null
 */
export async function getBoard(bdTable: string): Promise<IBoard | null> {
  try {
    const user = await prisma.board.findUnique({
      where: {
        bdTable: bdTable,
      },
    });

    return user;
  } catch {
    return null;
  }
}
