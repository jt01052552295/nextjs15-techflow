import prisma from '@/lib/prisma';

/**
 * 리뷰 수 기반 뱃지 동기화
 */
export async function syncReviewBadges(userId: string) {
  // 1. 현재 회원 리뷰 수 확인
  const reviewCount = await prisma.shopReview.count({
    where: { userId },
  });

  // 2. 리뷰 뱃지 마스터 불러오기
  const badgeList = await prisma.badgeMaster.findMany({
    where: {
      bmType: 'review',
      bmCategory: 'review_count',
      isUse: true,
    },
    orderBy: { bmThreshold: 'asc' },
    select: { uid: true, bmThreshold: true },
  });

  for (const badge of badgeList) {
    const { uid: badgeUid, bmThreshold: threshold } = badge;

    // 3. 해당 뱃지를 이미 가지고 있는지 확인
    const hasBadge = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId: badgeUid,
        },
      },
    });

    if (reviewCount >= threshold && !hasBadge) {
      // 4. 조건 충족 + 아직 없음 → INSERT
      await prisma.userBadge.create({
        data: {
          userId,
          badgeId: badgeUid,
        },
      });
    } else if (reviewCount < threshold && hasBadge) {
      // 5. 조건 미달 + 이미 있음 → DELETE
      await prisma.userBadge.delete({
        where: {
          userId_badgeId: {
            userId,
            badgeId: badgeUid,
          },
        },
      });
    }
  }
}

/**
 * 구매 횟수 기반 뱃지 동기화
 */
export async function syncPurchaseBadges(userId: string) {
  // 구매 횟수 확인 (Order 테이블이 있다고 가정)
  const purchaseCount = await prisma.shopOrder.count({
    where: {
      userId,
      // 완료된 주문만 카운트
      // status: 'completed'
    },
  });

  const badgeList = await prisma.badgeMaster.findMany({
    where: {
      bmType: 'purchase',
      bmCategory: 'purchase_count',
      isUse: true,
    },
    orderBy: { bmThreshold: 'asc' },
  });

  for (const badge of badgeList) {
    const hasBadge = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId: badge.uid,
        },
      },
    });

    if (purchaseCount >= badge.bmThreshold && !hasBadge) {
      await prisma.userBadge.create({
        data: { userId, badgeId: badge.uid },
      });
    } else if (purchaseCount < badge.bmThreshold && hasBadge) {
      await prisma.userBadge.delete({
        where: {
          userId_badgeId: { userId, badgeId: badge.uid },
        },
      });
    }
  }
}

/**
 * 구매 금액 기반 뱃지 동기화
 */
export async function syncPurchaseAmountBadges(userId: string) {
  // 총 구매 금액 확인
  const totalAmount = await prisma.shopOrder.aggregate({
    where: {
      userId,
      // status: 'completed'
    },
    _sum: {
      payPrice: true,
    },
  });

  const amount = totalAmount._sum.payPrice || 0;

  const badgeList = await prisma.badgeMaster.findMany({
    where: {
      bmType: 'purchase',
      bmCategory: 'purchase_amount',
      isUse: true,
    },
    orderBy: { bmThreshold: 'asc' },
  });

  for (const badge of badgeList) {
    const hasBadge = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId: badge.uid,
        },
      },
    });

    if (amount >= badge.bmThreshold && !hasBadge) {
      await prisma.userBadge.create({
        data: { userId, badgeId: badge.uid },
      });
    } else if (amount < badge.bmThreshold && hasBadge) {
      await prisma.userBadge.delete({
        where: {
          userId_badgeId: { userId, badgeId: badge.uid },
        },
      });
    }
  }
}

/**
 * 게시글 작성 수 기반 뱃지 동기화
 */
export async function syncPostBadges(userId: string) {
  const postCount = await prisma.bBS.count({
    where: {
      userId,
      isUse: true,
    },
  });

  const badgeList = await prisma.badgeMaster.findMany({
    where: {
      bmType: 'post',
      bmCategory: 'post_count',
      isUse: true,
    },
    orderBy: { bmThreshold: 'asc' },
  });

  for (const badge of badgeList) {
    const hasBadge = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId: badge.uid,
        },
      },
    });

    if (postCount >= badge.bmThreshold && !hasBadge) {
      await prisma.userBadge.create({
        data: { userId, badgeId: badge.uid },
      });
    } else if (postCount < badge.bmThreshold && hasBadge) {
      await prisma.userBadge.delete({
        where: {
          userId_badgeId: { userId, badgeId: badge.uid },
        },
      });
    }
  }
}

/**
 * 게시글 좋아요 수 기반 뱃지 동기화
 */
/**
 * 게시글 좋아요 수 기반 뱃지 동기화
 */
export async function syncPostLikesBadges(userId: string) {
  // 해당 유저가 작성한 게시글들의 총 좋아요 수 계산
  const userPosts = await prisma.bBS.findMany({
    where: {
      userId,
      isUse: true,
    },
    select: {
      idx: true,
    },
  });

  const postIds = userPosts.map((post) => post.idx);

  const likeCount = await prisma.bBSLike.count({
    where: {
      parentIdx: {
        in: postIds,
      },
    },
  });

  const badgeList = await prisma.badgeMaster.findMany({
    where: {
      bmType: 'post',
      bmCategory: 'post_likes',
      isUse: true,
    },
    orderBy: { bmThreshold: 'asc' },
  });

  for (const badge of badgeList) {
    const hasBadge = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId: badge.uid,
        },
      },
    });

    if (likeCount >= badge.bmThreshold && !hasBadge) {
      await prisma.userBadge.create({
        data: { userId, badgeId: badge.uid },
      });
    } else if (likeCount < badge.bmThreshold && hasBadge) {
      await prisma.userBadge.delete({
        where: {
          userId_badgeId: { userId, badgeId: badge.uid },
        },
      });
    }
  }
}
/**
 * 댓글 작성 수 기반 뱃지 동기화
 */
export async function syncCommentBadges(userId: string) {
  const commentCount = await prisma.bBSComment.count({
    where: {
      author: userId,
      isUse: true,
    },
  });

  const badgeList = await prisma.badgeMaster.findMany({
    where: {
      bmType: 'comment',
      bmCategory: 'comment_count',
      isUse: true,
    },
    orderBy: { bmThreshold: 'asc' },
  });

  for (const badge of badgeList) {
    const hasBadge = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId: badge.uid,
        },
      },
    });

    if (commentCount >= badge.bmThreshold && !hasBadge) {
      await prisma.userBadge.create({
        data: { userId, badgeId: badge.uid },
      });
    } else if (commentCount < badge.bmThreshold && hasBadge) {
      await prisma.userBadge.delete({
        where: {
          userId_badgeId: { userId, badgeId: badge.uid },
        },
      });
    }
  }
}

/**
 * 댓글 좋아요 수 기반 뱃지 동기화
 */
export async function syncCommentLikesBadges(userId: string) {
  const totalLikes = await prisma.bBSComment.aggregate({
    where: {
      author: userId,
      isUse: true,
    },
    _sum: {
      likeCount: true,
    },
  });

  const likeCount = totalLikes._sum.likeCount || 0;

  const badgeList = await prisma.badgeMaster.findMany({
    where: {
      bmType: 'comment',
      bmCategory: 'comment_likes',
      isUse: true,
    },
    orderBy: { bmThreshold: 'asc' },
  });

  for (const badge of badgeList) {
    const hasBadge = await prisma.userBadge.findUnique({
      where: {
        userId_badgeId: {
          userId,
          badgeId: badge.uid,
        },
      },
    });

    if (likeCount >= badge.bmThreshold && !hasBadge) {
      await prisma.userBadge.create({
        data: { userId, badgeId: badge.uid },
      });
    } else if (likeCount < badge.bmThreshold && hasBadge) {
      await prisma.userBadge.delete({
        where: {
          userId_badgeId: { userId, badgeId: badge.uid },
        },
      });
    }
  }
}

/**
 * 리뷰 좋아요 수 기반 뱃지 동기화
 */
export async function syncReviewLikesBadges(userId: string) {
  console.log(userId);
  //   const totalLikes = await prisma.shopReview.aggregate({
  //     where: {
  //       userId,
  //       isUse: true,
  //     },
  //     _sum: {
  //       likeCount: true,
  //     },
  //   });
  //   const likeCount = totalLikes._sum.likeCount || 0;
  //   const badgeList = await prisma.badgeMaster.findMany({
  //     where: {
  //       bmType: 'review',
  //       bmCategory: 'review_likes',
  //       isUse: true,
  //     },
  //     orderBy: { bmThreshold: 'asc' },
  //   });
  //   for (const badge of badgeList) {
  //     const hasBadge = await prisma.userBadge.findUnique({
  //       where: {
  //         userId_badgeId: {
  //           userId,
  //           badgeId: badge.uid,
  //         },
  //       },
  //     });
  //     if (likeCount >= badge.bmThreshold && !hasBadge) {
  //       await prisma.userBadge.create({
  //         data: { userId, badgeId: badge.uid },
  //       });
  //     } else if (likeCount < badge.bmThreshold && hasBadge) {
  //       await prisma.userBadge.delete({
  //         where: {
  //           userId_badgeId: { userId, badgeId: badge.uid },
  //         },
  //       });
  //     }
  //   }
}

/**
 * 모든 뱃지 동기화
 */
export async function syncAllBadges(userId: string) {
  await syncReviewBadges(userId);
  //   await syncReviewLikesBadges(userId);
  await syncPurchaseBadges(userId);
  await syncPurchaseAmountBadges(userId);
  await syncPostBadges(userId);
  await syncPostLikesBadges(userId);
  await syncCommentBadges(userId);
  await syncCommentLikesBadges(userId);
}
