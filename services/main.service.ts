import prisma from '@/lib/prisma';
import dayjs from 'dayjs';

// 방문자 통계에 사용할 인터페이스 정의
interface DeviceStats {
  mobile: number;
  tablet: number;
  desktop: number;
}

// date-fns의 eachDayOfInterval 기능 대체 함수
function eachDayOfInterval(interval: { start: Date; end: Date }) {
  const days = [];
  let current = dayjs(interval.start);
  const end = dayjs(interval.end);

  while (current.isBefore(end) || current.isSame(end, 'day')) {
    days.push(current.toDate());
    current = current.add(1, 'day');
  }

  return days;
}

export async function stat01(startDate: any, endDate: any): Promise<any> {
  try {
    // 상단 카드 통계 데이터 가져오기
    const [totalUsers, signoutUsers, totalPosts, totalComments, totalVisitors] =
      await Promise.all([
        // 가입 회원 수 (탈퇴하지 않은 회원)
        prisma.user.count({
          where: {
            isSignout: false,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),
        // 탈퇴 회원 수
        prisma.user.count({
          where: {
            isSignout: true,
            updatedAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),
        // 게시글 수
        prisma.bBS.count({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),
        // 댓글 수
        prisma.bBSComment.count({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),
        // 방문자 수 (AgentLog로부터)
        prisma.agentLog.count({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),
      ]);

    return {
      totalUsers,
      signoutUsers,
      totalPosts,
      totalComments,
      totalVisitors,
    };
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

// 중단 그래프 데이터 (일별 통계)
export async function stat02(startDate: any, endDate: any): Promise<any> {
  try {
    // 날짜 범위의 모든 일자 생성
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    // 각 날짜별로 데이터 집계
    const graphData = await Promise.all(
      days.map(async (day) => {
        const dayStart = new Date(day);
        const dayEnd = new Date(day);
        dayEnd.setHours(23, 59, 59, 999);

        const [dayUsers, daySignouts, dayPosts, dayComments, dayVisitors] =
          await Promise.all([
            // 해당 날짜의 가입회원 수
            prisma.user.count({
              where: {
                isSignout: false,
                createdAt: {
                  gte: dayStart,
                  lte: dayEnd,
                },
              },
            }),
            // 해당 날짜의 탈퇴회원 수
            prisma.user.count({
              where: {
                isSignout: true,
                updatedAt: {
                  gte: dayStart,
                  lte: dayEnd,
                },
              },
            }),
            // 해당 날짜의 게시글 수
            prisma.bBS.count({
              where: {
                createdAt: {
                  gte: dayStart,
                  lte: dayEnd,
                },
              },
            }),
            // 해당 날짜의 댓글 수
            prisma.bBSComment.count({
              where: {
                createdAt: {
                  gte: dayStart,
                  lte: dayEnd,
                },
              },
            }),
            // 해당 날짜의 방문자 수
            prisma.agentLog.count({
              where: {
                createdAt: {
                  gte: dayStart,
                  lte: dayEnd,
                },
              },
            }),
          ]);

        return {
          date: dayjs(day).format('YYYY-MM-DD'),
          users: dayUsers,
          signouts: daySignouts,
          posts: dayPosts,
          comments: dayComments,
          visitors: dayVisitors,
        };
      }),
    );

    return graphData;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// 하단 목록 데이터 (최근 활동)
export async function stat03(
  startDate: any,
  endDate: any,
  limit: number = 10,
): Promise<any> {
  try {
    // 최근 게시글 조회
    const recentPosts = await prisma.bBS.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      include: {
        user: {
          select: {
            name: true,
          },
        },
        board: {
          select: {
            bdName: true,
          },
        },
      },
    });

    // 최근 댓글 조회
    const recentComments = await prisma.bBSComment.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      include: {
        user: {
          select: {
            name: true,
          },
        },
        bbs: {
          select: {
            subject: true,
          },
        },
      },
    });

    // 최근 가입한 회원 조회
    const recentUsers = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        isSignout: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      select: {
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // 최근 탈퇴한 회원 조회
    const recentSignouts = await prisma.user.findMany({
      where: {
        updatedAt: {
          gte: startDate,
          lte: endDate,
        },
        isSignout: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit,
      select: {
        name: true,
        email: true,
        updatedAt: true,
      },
    });

    // 최근 방문자 로그
    const recentVisitors = await prisma.agentLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      select: {
        browser: true,
        os: true,
        ip: true,
        host: true,
        createdAt: true,
      },
    });

    // 최근 활동 목록 통합 및 변환
    const recentPosts2 = recentPosts.map((post) => ({
      id: `post-${post.idx}`,
      type: '게시글',
      board: post.board?.bdName || '게시판',
      content: post.subject,
      user: post.user?.name || '알 수 없음',
      createdAt: post.createdAt,
    }));

    const recentComments2 = recentComments.map((comment) => ({
      id: `comment-${comment.idx}`,
      type: '댓글',
      content: `${comment.bbs?.subject || '게시글'} - 댓글`,
      user: comment.user?.name || '알 수 없음',
      createdAt: comment.createdAt,
    }));

    const recentUsers2 = recentUsers.map((user) => ({
      id: `user-${user.email}`,
      type: '가입회원',
      content: `${user.email}`,
      user: user.name,
      createdAt: user.createdAt,
    }));

    const recentSignouts2 = recentSignouts.map((user) => ({
      id: `signout-${user.email}`,
      type: '탈퇴회원',
      content: `${user.email}`,
      user: user.name,
      createdAt: user.updatedAt,
    }));

    const recentVisitors2 = recentVisitors.map((visitor, index) => ({
      id: `visitor-${index}`,
      type: '방문자',
      content: `${visitor.host} (${visitor.ip})`,
      user: `${visitor.browser} / ${visitor.os}`,
      createdAt: visitor.createdAt,
    }));

    // 모든 활동 목록 합치고 날짜 기준으로 정렬 (최신순)
    const allActivities = [
      ...recentPosts2,
      ...recentComments2,
      ...recentUsers2,
      ...recentSignouts2,
      ...recentVisitors2,
    ]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);

    return allActivities;
  } catch (error) {
    console.error(error);
    return [];
  }
}

// 방문자 통계 - 브라우저, OS, 디바이스 별 통계
export async function stat04(startDate: any, endDate: any): Promise<any> {
  try {
    // 브라우저별 방문자 통계
    const browserStats = await prisma.$queryRaw`
      SELECT browser, COUNT(*) as count
      FROM ec_agent_log
      WHERE created_at >= ${startDate} AND created_at <= ${endDate}
      GROUP BY browser
      ORDER BY count DESC
    `;

    // OS별 방문자 통계
    const osStats = await prisma.$queryRaw`
      SELECT os, COUNT(*) as count
      FROM ec_agent_log
      WHERE created_at >= ${startDate} AND created_at <= ${endDate}
      GROUP BY os
      ORDER BY count DESC
    `;

    // 디바이스 타입별 방문자 통계 (모바일/태블릿/데스크탑)
    const deviceStats = await prisma.$queryRaw<DeviceStats[]>`
      SELECT 
        SUM(CASE WHEN is_mobile = 1 THEN 1 ELSE 0 END) as mobile,
        SUM(CASE WHEN is_tablet = 1 THEN 1 ELSE 0 END) as tablet,
        SUM(CASE WHEN is_desktop = 1 THEN 1 ELSE 0 END) as desktop
      FROM ec_agent_log
      WHERE created_at >= ${startDate} AND created_at <= ${endDate}
    `;

    // 시간대별 방문자 통계
    const hourlyStats = await prisma.$queryRaw`
      SELECT 
        HOUR(created_at) as hour, 
        COUNT(*) as count
      FROM ec_agent_log
      WHERE created_at >= ${startDate} AND created_at <= ${endDate}
      GROUP BY HOUR(created_at)
      ORDER BY hour ASC
    `;

    return {
      browserStats,
      osStats,
      deviceStats: deviceStats[0],
      hourlyStats,
    };
  } catch (error) {
    console.error(error);
    return {
      browserStats: [],
      osStats: [],
      deviceStats: { mobile: 0, tablet: 0, desktop: 0 } as DeviceStats,
      hourlyStats: [],
    };
  }
}
