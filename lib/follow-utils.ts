import prisma from '@/lib/prisma';
import { FollowStatus } from '@prisma/client';

/**
 * 팔로우 신청
 */
export async function followRequest(followerIdx: number, followingIdx: number) {
  // 차단 여부 확인: 상대방이 나를 차단한 경우
  const isBlocked = await prisma.userBlock.findUnique({
    where: {
      blockerIdx_blockedIdx: {
        blockerIdx: followingIdx,
        blockedIdx: followerIdx,
      },
    },
  });

  if (isBlocked) {
    return { success: false, message: '차단된 사용자입니다.' };
  }

  // 이미 요청했는지 확인
  const exists = await prisma.userFollow.findUnique({
    where: {
      unique_follow: {
        followerIdx,
        followingIdx,
      },
    },
  });

  if (exists) {
    return { success: false, message: '이미 팔로우 요청했습니다.' };
  }

  const follow = await prisma.userFollow.create({
    data: {
      followerIdx,
      followingIdx,
      status: FollowStatus.WAITING,
    },
  });

  return {
    success: true,
    message: '팔로우 요청이 완료되었습니다.',
    data: follow,
  };
}

/**
 * 팔로우 승인
 */
export async function followAccept(followerIdx: number, followingIdx: number) {
  const exists = await prisma.userFollow.findFirst({
    where: {
      followerIdx,
      followingIdx,
      status: FollowStatus.WAITING,
    },
  });

  if (!exists) {
    return { success: false, message: '승인할 요청이 없습니다.' };
  }

  await prisma.$transaction([
    // 팔로우 상태 승인으로 변경
    prisma.userFollow.update({
      where: {
        unique_follow: {
          followerIdx,
          followingIdx,
        },
      },
      data: {
        status: FollowStatus.APPROVED,
        confirmDate: new Date(),
      },
    }),
    // 팔로워의 팔로잉 수 증가
    prisma.user.update({
      where: { idx: followerIdx },
      data: { followingCnt: { increment: 1 } },
    }),
    // 팔로잉의 팔로워 수 증가
    prisma.user.update({
      where: { idx: followingIdx },
      data: { followerCnt: { increment: 1 } },
    }),
  ]);

  return { success: true, message: '팔로우 승인이 완료되었습니다.' };
}

/**
 * 팔로우 거절
 */
export async function followReject(followerIdx: number, followingIdx: number) {
  const exists = await prisma.userFollow.findFirst({
    where: {
      followerIdx,
      followingIdx,
      status: FollowStatus.WAITING,
    },
  });

  if (!exists) {
    return { success: false, message: '거절할 요청이 없습니다.' };
  }

  await prisma.userFollow.update({
    where: {
      unique_follow: {
        followerIdx,
        followingIdx,
      },
    },
    data: {
      status: FollowStatus.REJECTED,
      confirmDate: new Date(),
    },
  });

  return { success: true, message: '팔로우 요청을 거절했습니다.' };
}

/**
 * 팔로우 바로 승인 (요청 없이)
 */
export async function followApprove(followerIdx: number, followingIdx: number) {
  // 차단 여부 확인
  const isBlocked = await prisma.userBlock.findUnique({
    where: {
      blockerIdx_blockedIdx: {
        blockerIdx: followingIdx,
        blockedIdx: followerIdx,
      },
    },
  });

  if (isBlocked) {
    return { success: false, message: '차단된 사용자입니다.' };
  }

  // 이미 팔로잉 중인지 확인
  const exists = await prisma.userFollow.findFirst({
    where: {
      followerIdx,
      followingIdx,
      status: FollowStatus.APPROVED,
    },
  });

  if (exists) {
    return { success: false, message: '이미 팔로잉 중입니다.' };
  }

  await prisma.$transaction([
    prisma.userFollow.create({
      data: {
        followerIdx,
        followingIdx,
        status: FollowStatus.APPROVED,
        confirmDate: new Date(),
      },
    }),
    prisma.user.update({
      where: { idx: followerIdx },
      data: { followingCnt: { increment: 1 } },
    }),
    prisma.user.update({
      where: { idx: followingIdx },
      data: { followerCnt: { increment: 1 } },
    }),
  ]);

  // TODO: FCM 알림 전송

  return { success: true, message: '팔로우가 완료되었습니다.' };
}

/**
 * 언팔로우
 */
export async function unfollow(followerIdx: number, followingIdx: number) {
  const exists = await prisma.userFollow.findFirst({
    where: {
      followerIdx,
      followingIdx,
      status: FollowStatus.APPROVED,
    },
  });

  if (!exists) {
    return { success: false, message: '팔로우 관계가 아닙니다.' };
  }

  await prisma.$transaction([
    prisma.userFollow.delete({
      where: {
        unique_follow: {
          followerIdx,
          followingIdx,
        },
      },
    }),
    prisma.user.update({
      where: { idx: followerIdx },
      data: { followingCnt: { decrement: 1 } },
    }),
    prisma.user.update({
      where: { idx: followingIdx },
      data: { followerCnt: { decrement: 1 } },
    }),
  ]);

  return { success: true, message: '언팔로우가 완료되었습니다.' };
}

/**
 * 팔로워 제거
 */
export async function followRemove(myIdx: number, followerIdx: number) {
  const exists = await prisma.userFollow.findFirst({
    where: {
      followerIdx,
      followingIdx: myIdx,
      status: FollowStatus.APPROVED,
    },
  });

  if (!exists) {
    return { success: false, message: '팔로워 관계가 아닙니다.' };
  }

  await prisma.$transaction([
    prisma.userFollow.delete({
      where: {
        unique_follow: {
          followerIdx,
          followingIdx: myIdx,
        },
      },
    }),
    prisma.user.update({
      where: { idx: followerIdx },
      data: { followingCnt: { decrement: 1 } },
    }),
    prisma.user.update({
      where: { idx: myIdx },
      data: { followerCnt: { decrement: 1 } },
    }),
  ]);

  return { success: true, message: '팔로워를 제거했습니다.' };
}

/**
 * 팔로잉 목록
 */
export async function getFollowingList(memberIdx: number) {
  const list = await prisma.userFollow.findMany({
    where: {
      followerIdx: memberIdx,
      status: FollowStatus.APPROVED,
    },
    include: {
      following: {
        select: {
          idx: true,
          id: true,
          name: true,
          nick: true,
          profile: true,
        },
      },
    },
    orderBy: {
      confirmDate: 'desc',
    },
  });

  return { list, total: list.length };
}

/**
 * 팔로워 목록
 */
export async function getFollowerList(memberIdx: number) {
  const list = await prisma.userFollow.findMany({
    where: {
      followingIdx: memberIdx,
      status: FollowStatus.APPROVED,
    },
    include: {
      follower: {
        select: {
          idx: true,
          id: true,
          name: true,
          nick: true,
          profile: true,
        },
      },
    },
    orderBy: {
      confirmDate: 'desc',
    },
  });

  return { list, total: list.length };
}

/**
 * 내가 팔로우 신청한 승인 대기 목록
 */
export async function getMyFollowPendingList(memberIdx: number) {
  const list = await prisma.userFollow.findMany({
    where: {
      followerIdx: memberIdx,
      status: FollowStatus.WAITING,
    },
    include: {
      following: {
        select: {
          idx: true,
          id: true,
          name: true,
          nick: true,
          profile: true,
        },
      },
    },
    orderBy: {
      followDate: 'desc',
    },
  });

  return { list, total: list.length };
}

/**
 * 나를 팔로우 신청한 승인 대기 목록
 */
export async function getFollowPendingList(memberIdx: number) {
  const list = await prisma.userFollow.findMany({
    where: {
      followingIdx: memberIdx,
      status: FollowStatus.WAITING,
    },
    include: {
      follower: {
        select: {
          idx: true,
          id: true,
          name: true,
          nick: true,
          profile: true,
        },
      },
    },
    orderBy: {
      followDate: 'desc',
    },
  });

  return { list, total: list.length };
}

/**
 * 내가 팔로우 신청한 거절된 목록
 */
export async function getFollowRejectedList(memberIdx: number) {
  const list = await prisma.userFollow.findMany({
    where: {
      followerIdx: memberIdx,
      status: FollowStatus.REJECTED,
    },
    include: {
      following: {
        select: {
          idx: true,
          id: true,
          name: true,
          nick: true,
          profile: true,
        },
      },
    },
    orderBy: {
      confirmDate: 'desc',
    },
  });

  return { list, total: list.length };
}

/**
 * 나를 팔로우 신청한 내가 거절한 목록
 */
export async function getFollowerRejectedList(memberIdx: number) {
  const list = await prisma.userFollow.findMany({
    where: {
      followingIdx: memberIdx,
      status: FollowStatus.REJECTED,
    },
    include: {
      follower: {
        select: {
          idx: true,
          id: true,
          name: true,
          nick: true,
          profile: true,
        },
      },
    },
    orderBy: {
      confirmDate: 'desc',
    },
  });

  return { list, total: list.length };
}

/**
 * 팔로워 차단
 */
export async function blockFollower(meIdx: number, followerIdx: number) {
  // 이미 차단했는지 확인
  const isBlocked = await prisma.userBlock.findUnique({
    where: {
      blockerIdx_blockedIdx: {
        blockerIdx: meIdx,
        blockedIdx: followerIdx,
      },
    },
  });

  if (isBlocked) {
    return { success: false, message: '이미 차단한 사용자입니다.' };
  }

  await prisma.$transaction(async (tx) => {
    // 차단 정보 등록
    await tx.userBlock.create({
      data: {
        blockerIdx: meIdx,
        blockedIdx: followerIdx,
      },
    });

    // 팔로우 관계 끊기 (양방향)
    const follows = await tx.userFollow.findMany({
      where: {
        OR: [
          { followerIdx: meIdx, followingIdx: followerIdx },
          { followerIdx: followerIdx, followingIdx: meIdx },
        ],
      },
    });

    for (const follow of follows) {
      await tx.userFollow.delete({
        where: {
          unique_follow: {
            followerIdx: follow.followerIdx,
            followingIdx: follow.followingIdx,
          },
        },
      });

      // 카운트 감소
      await tx.user.update({
        where: { idx: follow.followerIdx },
        data: { followingCnt: { decrement: 1 } },
      });
      await tx.user.update({
        where: { idx: follow.followingIdx },
        data: { followerCnt: { decrement: 1 } },
      });
    }
  });

  return { success: true, message: '차단이 완료되었습니다.' };
}

/**
 * 팔로워 차단 해제
 */
export async function unblockFollower(meIdx: number, followerIdx: number) {
  const deleted = await prisma.userBlock.deleteMany({
    where: {
      blockerIdx: meIdx,
      blockedIdx: followerIdx,
    },
  });

  if (deleted.count > 0) {
    return { success: true, message: '차단 해제가 완료되었습니다.' };
  } else {
    return { success: false, message: '차단 해제에 실패했습니다.' };
  }
}

/**
 * 내가 상대를 차단했는지 확인
 */
export async function myBlocked(meIdx: number, targetIdx: number) {
  const blocked = await prisma.userBlock.findUnique({
    where: {
      blockerIdx_blockedIdx: {
        blockerIdx: meIdx,
        blockedIdx: targetIdx,
      },
    },
  });
  return !!blocked;
}

/**
 * 상대가 나를 차단했는지 확인
 */
export async function otherBlocked(targetIdx: number, meIdx: number) {
  const blocked = await prisma.userBlock.findUnique({
    where: {
      blockerIdx_blockedIdx: {
        blockerIdx: targetIdx,
        blockedIdx: meIdx,
      },
    },
  });
  return !!blocked;
}

/**
 * 차단 여부 확인 (양방향)
 */
export async function isBlocked(meIdx: number, targetIdx: number) {
  return (
    (await myBlocked(meIdx, targetIdx)) ||
    (await otherBlocked(targetIdx, meIdx))
  );
}

/**
 * 나의 차단 목록
 */
export async function getBlockedList(meIdx: number) {
  const list = await prisma.userBlock.findMany({
    where: {
      blockerIdx: meIdx,
    },
    include: {
      blocked: {
        select: {
          idx: true,
          id: true,
          name: true,
          nick: true,
          profile: true,
        },
      },
    },
    orderBy: {
      blockDate: 'desc',
    },
  });

  return { list, total: list.length };
}

/**
 * 팔로잉 가능한 회원 목록 (나 제외, 이미 팔로잉 중 제외, 차단 제외)
 */
export async function getUnfollowingList(memberIdx: number) {
  // 이미 팔로잉 중인 회원 ID 조회
  const followingIds = await prisma.userFollow.findMany({
    where: {
      followerIdx: memberIdx,
      status: FollowStatus.APPROVED,
    },
    select: { followingIdx: true },
  });

  const followingIdxList = followingIds.map((f) => f.followingIdx);

  // 차단한 회원 ID 조회
  const blockedByMe = await prisma.userBlock.findMany({
    where: { blockerIdx: memberIdx },
    select: { blockedIdx: true },
  });

  // 나를 차단한 회원 ID 조회
  const blockedMe = await prisma.userBlock.findMany({
    where: { blockedIdx: memberIdx },
    select: { blockerIdx: true },
  });

  const blockedIds = [
    ...blockedByMe.map((b) => b.blockedIdx),
    ...blockedMe.map((b) => b.blockerIdx),
  ];

  const list = await prisma.user.findMany({
    where: {
      idx: {
        not: memberIdx,
        notIn: [...followingIdxList, ...blockedIds],
      },
      // level: 2, // 필요시 추가
    },
    select: {
      idx: true,
      id: true,
      name: true,
      nick: true,
      profile: true,
    },
    orderBy: {
      idx: 'desc',
    },
  });

  return { list, total: list.length };
}

/**
 * 특정 회원의 팔로잉 목록 (나 제외)
 */
export async function getFollowingListExceptMe(
  memberIdx: number,
  myIdx: number,
) {
  const list = await prisma.userFollow.findMany({
    where: {
      followerIdx: memberIdx,
      followingIdx: { not: myIdx },
      status: FollowStatus.APPROVED,
    },
    include: {
      following: {
        select: {
          idx: true,
          id: true,
          name: true,
          nick: true,
          profile: true,
        },
      },
    },
    orderBy: {
      confirmDate: 'desc',
    },
  });

  return { list, total: list.length };
}

/**
 * 특정 회원의 팔로워 목록 (나 제외)
 */
export async function getFollowerListExceptMe(
  memberIdx: number,
  myIdx: number,
) {
  const list = await prisma.userFollow.findMany({
    where: {
      followingIdx: memberIdx,
      followerIdx: { not: myIdx },
      status: FollowStatus.APPROVED,
    },
    include: {
      follower: {
        select: {
          idx: true,
          id: true,
          name: true,
          nick: true,
          profile: true,
        },
      },
    },
    orderBy: {
      confirmDate: 'desc',
    },
  });

  return { list, total: list.length };
}

/**
 * 내가 팔로잉 중인 회원 ID 목록
 */
export async function getMyFollowingIds(myIdx: number) {
  const follows = await prisma.userFollow.findMany({
    where: {
      followerIdx: myIdx,
      status: FollowStatus.APPROVED,
    },
    select: {
      followingIdx: true,
    },
  });

  return follows.map((f) => f.followingIdx);
}
