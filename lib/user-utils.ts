import prisma from '@/lib/prisma';
import type { IUser } from '@/types/user';
import { UserRole, Prisma } from '@prisma/client';

/**
 * 활성화된 사용자 목록을 가져옵니다
 * @param limit 최대 사용자 수 (기본값: 100)
 * @returns 사용자 목록 (id, name, email)
 */
export async function getActiveUsers(limit?: number): Promise<IUser[]> {
  try {
    const users = await prisma.user.findMany({
      where: {
        // isUse: true, // 조건 하나씩 추가
        // isSignout: false,
        // level: { lt: 99 },
        // NOT: { role: UserRole.ADMIN },
      },
      include: {
        profile: true,
      },
      orderBy: {
        idx: Prisma.SortOrder.desc,
      },
      ...(limit ? { take: limit } : {}),
    });

    console.log(`Found ${users.length} users with isUse=true`);
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

/**
 * 사용자 ID로 사용자 정보를 조회합니다
 * @param userId 사용자 ID
 * @returns 사용자 정보 또는 null
 */
export async function getUser(userId: string): Promise<IUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    return user;
  } catch {
    return null;
  }
}
