import prisma from '@/lib/prisma';

interface AddPointParams {
  userId: string;
  point: number;
  otGubun?: string;
  otCode?: string;
  message?: string;
}

interface UsePointParams {
  userId: string;
  point: number;
  otGubun?: string;
  otCode?: string;
  message?: string;
}

/**
 * 포인트 적립
 */
export async function addPoint(params: AddPointParams) {
  const { userId, point, otGubun = '', otCode = '', message = '' } = params;

  if (!userId || !point || point <= 0) {
    return { success: false, message: '유효하지 않은 파라미터입니다.' };
  }

  try {
    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, message: '사용자를 찾을 수 없습니다.' };
    }

    // 만료일 설정 (1년 후)
    const expiredAt = new Date();
    expiredAt.setFullYear(expiredAt.getFullYear() + 1);

    await prisma.$transaction([
      // 1. 포인트 내역 추가
      prisma.point.create({
        data: {
          userId,
          point,
          usePoint: 0,
          status: 'add',
          expired: false,
          expiredAt,
          otGubun,
          otCode,
          message,
        },
      }),
      // 2. 사용자 총 포인트 업데이트 (User 스키마에 totalPoint 필드가 있다면)
      // prisma.user.update({
      //   where: { id: userId },
      //   data: { totalPoint: { increment: point } },
      // }),
    ]);

    return { success: true, message: '포인트가 적립되었습니다.' };
  } catch (error) {
    console.error('포인트 적립 오류:', error);
    return { success: false, message: '포인트 적립에 실패했습니다.' };
  }
}

/**
 * 포인트 사용
 */
export async function deductPoint(params: UsePointParams) {
  const { userId, point, otGubun = '', otCode = '', message = '' } = params;

  if (!userId || !point || point <= 0) {
    return { success: false, message: '유효하지 않은 파라미터입니다.' };
  }

  try {
    // 사용 가능한 총 포인트 확인
    const availablePoints = await prisma.point.aggregate({
      where: {
        userId,
        status: 'add',
        expired: false,
      },
      _sum: {
        point: true,
        usePoint: true,
      },
    });

    const totalPoint =
      (availablePoints._sum.point || 0) - (availablePoints._sum.usePoint || 0);

    if (totalPoint < point) {
      return { success: false, message: '사용 가능한 포인트가 부족합니다.' };
    }

    await prisma.$transaction(async (tx) => {
      // 1. 사용 내역 추가
      await tx.point.create({
        data: {
          userId,
          point: -point, // 음수로 저장
          usePoint: 0,
          status: 'remove',
          expired: true,
          expiredAt: new Date(),
          otGubun,
          otCode,
          message,
        },
      });

      // 2. 포인트 차감 처리 (만료일 오름차순)
      const pointList = await tx.point.findMany({
        where: {
          userId,
          status: 'add',
          expired: false,
        },
        orderBy: {
          expiredAt: 'asc',
        },
      });

      let remaining = point;

      for (const item of pointList) {
        const available = item.point - item.usePoint;

        if (available >= remaining) {
          // 현재 포인트에서 충분히 차감 가능
          const newUsePoint = item.usePoint + remaining;
          await tx.point.update({
            where: { idx: item.idx },
            data: {
              usePoint: newUsePoint,
              expired: newUsePoint === item.point, // 모두 사용하면 만료 처리
            },
          });
          break;
        } else {
          // 현재 포인트에서 일부만 차감
          await tx.point.update({
            where: { idx: item.idx },
            data: {
              usePoint: item.point,
              expired: true,
            },
          });
          remaining -= available;
        }
      }

      // 3. 사용자 총 포인트 업데이트 (User 스키마에 totalPoint 필드가 있다면)
      // await tx.user.update({
      //   where: { id: userId },
      //   data: { totalPoint: { decrement: point } },
      // });
    });

    return { success: true, message: '포인트가 사용되었습니다.' };
  } catch (error) {
    console.error('포인트 사용 오류:', error);
    return { success: false, message: '포인트 사용에 실패했습니다.' };
  }
}

/**
 * 만료 포인트 처리
 */
export async function expirePoints(userId: string) {
  try {
    // 만료된 포인트 조회
    const expiredPoints = await prisma.point.aggregate({
      where: {
        userId,
        status: 'add',
        expired: false,
        expiredAt: {
          lt: new Date(),
        },
      },
      _sum: {
        point: true,
        usePoint: true,
      },
    });

    const expiredSum =
      (expiredPoints._sum.point || 0) - (expiredPoints._sum.usePoint || 0);

    if (expiredSum <= 0) {
      return {
        success: true,
        expiredPoint: 0,
        message: '만료된 포인트가 없습니다.',
      };
    }

    await prisma.$transaction(async (tx) => {
      // 1. 만료 내역 추가
      await tx.point.create({
        data: {
          userId,
          point: -expiredSum,
          usePoint: 0,
          status: 'remove_expired',
          expired: true,
          expiredAt: new Date(),
          message: '포인트 기간 만료',
        },
      });

      // 2. 만료된 포인트 차감 처리
      const pointList = await tx.point.findMany({
        where: {
          userId,
          status: 'add',
          expired: false,
        },
        orderBy: {
          expiredAt: 'asc',
        },
      });

      let remaining = expiredSum;

      for (const item of pointList) {
        const available = item.point - item.usePoint;

        if (available >= remaining) {
          const newUsePoint = item.usePoint + remaining;
          await tx.point.update({
            where: { idx: item.idx },
            data: {
              usePoint: newUsePoint,
              expired: newUsePoint === item.point,
            },
          });
          break;
        } else {
          await tx.point.update({
            where: { idx: item.idx },
            data: {
              usePoint: item.point,
              expired: true,
            },
          });
          remaining -= available;
        }
      }

      // 3. 사용자 총 포인트 업데이트 (User 스키마에 totalPoint 필드가 있다면)
      // await tx.user.update({
      //   where: { id: userId },
      //   data: { totalPoint: { decrement: expiredSum } },
      // });
    });

    return {
      success: true,
      expiredPoint: expiredSum,
      message: `${expiredSum} 포인트가 만료되었습니다.`,
    };
  } catch (error) {
    console.error('포인트 만료 처리 오류:', error);
    return { success: false, message: '포인트 만료 처리에 실패했습니다.' };
  }
}

/**
 * 특정 코드로 포인트 사용 가능 여부 확인
 */
export async function checkPointUsable(otCode: string) {
  try {
    const pointData = await prisma.point.aggregate({
      where: {
        otCode,
        status: 'add',
        expired: false,
        expiredAt: {
          gt: new Date(),
        },
      },
      _sum: {
        point: true,
        usePoint: true,
      },
    });

    const totalPoint = pointData._sum.point || 0;
    const usedPoint = pointData._sum.usePoint || 0;

    // 포인트가 있고, 모두 사용된 경우 true 반환
    return totalPoint > 0 && totalPoint === usedPoint;
  } catch (error) {
    console.error('포인트 사용 가능 여부 확인 오류:', error);
    return false;
  }
}

/**
 * 사용 가능한 포인트 조회
 */
export async function getAvailablePoint(userId: string) {
  try {
    const availablePoints = await prisma.point.aggregate({
      where: {
        userId,
        status: 'add',
        expired: false,
      },
      _sum: {
        point: true,
        usePoint: true,
      },
    });

    const totalPoint =
      (availablePoints._sum.point || 0) - (availablePoints._sum.usePoint || 0);

    return { success: true, availablePoint: totalPoint };
  } catch (error) {
    console.error('사용 가능 포인트 조회 오류:', error);
    return { success: false, availablePoint: 0 };
  }
}

/**
 * 포인트 내역 조회
 */
export async function getPointHistory(userId: string, limit = 50) {
  try {
    const history = await prisma.point.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return { success: true, data: history };
  } catch (error) {
    console.error('포인트 내역 조회 오류:', error);
    return { success: false, data: [] };
  }
}
