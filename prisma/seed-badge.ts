import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.badgeMaster.createMany({
    data: [
      // 리뷰 작성
      {
        bmType: 'review',
        bmCategory: 'review_count',
        bmLevel: 'Rookie',
        bmThreshold: 1,
        bmName: '리뷰 루키',
      },
      {
        bmType: 'review',
        bmCategory: 'review_count',
        bmLevel: 'Bronze',
        bmThreshold: 5,
        bmName: '리뷰 브론즈',
      },
      {
        bmType: 'review',
        bmCategory: 'review_count',
        bmLevel: 'Silver',
        bmThreshold: 20,
        bmName: '리뷰 실버',
      },
      {
        bmType: 'review',
        bmCategory: 'review_count',
        bmLevel: 'Gold',
        bmThreshold: 50,
        bmName: '리뷰 골드',
      },
      {
        bmType: 'review',
        bmCategory: 'review_count',
        bmLevel: 'Platinum',
        bmThreshold: 100,
        bmName: '리뷰 플래티넘',
      },
      {
        bmType: 'review',
        bmCategory: 'review_count',
        bmLevel: 'King',
        bmThreshold: 200,
        bmName: '리뷰 킹',
      },

      // 리뷰 좋아요
      {
        bmType: 'review',
        bmCategory: 'review_likes',
        bmLevel: 'Popular',
        bmThreshold: 50,
        bmName: '인기 리뷰어',
      },
      {
        bmType: 'review',
        bmCategory: 'review_likes',
        bmLevel: 'Star',
        bmThreshold: 200,
        bmName: '스타 리뷰어',
      },

      // 구매 횟수
      {
        bmType: 'purchase',
        bmCategory: 'purchase_count',
        bmLevel: 'Rookie',
        bmThreshold: 1,
        bmName: '첫 구매자',
      },
      {
        bmType: 'purchase',
        bmCategory: 'purchase_count',
        bmLevel: 'Bronze',
        bmThreshold: 5,
        bmName: '단골 고객',
      },
      {
        bmType: 'purchase',
        bmCategory: 'purchase_count',
        bmLevel: 'Silver',
        bmThreshold: 15,
        bmName: '실버 고객',
      },
      {
        bmType: 'purchase',
        bmCategory: 'purchase_count',
        bmLevel: 'Gold',
        bmThreshold: 30,
        bmName: '골드 고객',
      },
      {
        bmType: 'purchase',
        bmCategory: 'purchase_count',
        bmLevel: 'Platinum',
        bmThreshold: 50,
        bmName: '플래티넘 고객',
      },
      {
        bmType: 'purchase',
        bmCategory: 'purchase_count',
        bmLevel: 'King',
        bmThreshold: 100,
        bmName: 'VIP 고객',
      },

      // 구매 금액
      {
        bmType: 'purchase',
        bmCategory: 'purchase_amount',
        bmLevel: 'Bronze',
        bmThreshold: 100000,
        bmName: '10만원 구매자',
      },
      {
        bmType: 'purchase',
        bmCategory: 'purchase_amount',
        bmLevel: 'Silver',
        bmThreshold: 500000,
        bmName: '50만원 구매자',
      },
      {
        bmType: 'purchase',
        bmCategory: 'purchase_amount',
        bmLevel: 'Gold',
        bmThreshold: 1000000,
        bmName: '100만원 구매자',
      },

      // 게시글 작성
      {
        bmType: 'post',
        bmCategory: 'post_count',
        bmLevel: 'Rookie',
        bmThreshold: 1,
        bmName: '첫 게시글',
      },
      {
        bmType: 'post',
        bmCategory: 'post_count',
        bmLevel: 'Bronze',
        bmThreshold: 10,
        bmName: '열정 작가',
      },
      {
        bmType: 'post',
        bmCategory: 'post_count',
        bmLevel: 'Silver',
        bmThreshold: 30,
        bmName: '실버 작가',
      },
      {
        bmType: 'post',
        bmCategory: 'post_count',
        bmLevel: 'Gold',
        bmThreshold: 50,
        bmName: '골드 작가',
      },
      {
        bmType: 'post',
        bmCategory: 'post_count',
        bmLevel: 'King',
        bmThreshold: 100,
        bmName: '베스트 작가',
      },

      // 게시글 좋아요
      {
        bmType: 'post',
        bmCategory: 'post_likes',
        bmLevel: 'Popular',
        bmThreshold: 100,
        bmName: '인기 작가',
      },
      {
        bmType: 'post',
        bmCategory: 'post_likes',
        bmLevel: 'Star',
        bmThreshold: 500,
        bmName: '스타 작가',
      },

      // 댓글 작성
      {
        bmType: 'comment',
        bmCategory: 'comment_count',
        bmLevel: 'Rookie',
        bmThreshold: 1,
        bmName: '첫 댓글',
      },
      {
        bmType: 'comment',
        bmCategory: 'comment_count',
        bmLevel: 'Bronze',
        bmThreshold: 20,
        bmName: '활발한 댓글러',
      },
      {
        bmType: 'comment',
        bmCategory: 'comment_count',
        bmLevel: 'Silver',
        bmThreshold: 50,
        bmName: '실버 댓글러',
      },
      {
        bmType: 'comment',
        bmCategory: 'comment_count',
        bmLevel: 'Gold',
        bmThreshold: 100,
        bmName: '골드 댓글러',
      },
      {
        bmType: 'comment',
        bmCategory: 'comment_count',
        bmLevel: 'King',
        bmThreshold: 200,
        bmName: '댓글 킹',
      },

      // 댓글 좋아요
      {
        bmType: 'comment',
        bmCategory: 'comment_likes',
        bmLevel: 'Popular',
        bmThreshold: 50,
        bmName: '인기 댓글러',
      },
      {
        bmType: 'comment',
        bmCategory: 'comment_likes',
        bmLevel: 'Star',
        bmThreshold: 200,
        bmName: '스타 댓글러',
      },
    ],
  });

  console.log('✅ Badge seeds created successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding badges:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
