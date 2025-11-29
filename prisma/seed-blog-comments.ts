import { PrismaClient, PostCommentStatus } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const adapter = new PrismaMariaDb(connectionString);
const prisma = new PrismaClient({ adapter });

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 미리 생성된 회원 ID 목록
const USER_IDS = [
  '81cf6d86-72da-45ad-8440-2ea76ded67bb',
  'ab249162-a286-4c48-9778-c4b8747b4554',
  'ab84dabf-2029-469c-b2a6-03b421f492c1',
  'c7f6ee32-aa08-46db-b82d-b3a021a2eb8a',
  'c2d35ab7-27ea-4d00-925b-b4d7efe442ee',
];

const COMMENT_CONTENTS = [
  '정말 유익한 글이네요! 많은 도움이 되었습니다.',
  '좋은 정보 감사합니다. 잘 읽었어요.',
  '궁금했던 내용인데 자세히 설명해주셔서 감사합니다.',
  '이 부분 좀 더 자세히 알려주실 수 있나요?',
  '정말 잘 정리된 글이네요. 북마크해둡니다!',
  '저도 비슷한 경험이 있어서 공감이 많이 갑니다.',
  '이런 관점은 생각 못했는데 새롭네요.',
  '좋은 글 공유해주셔서 감사합니다.',
  '실무에 바로 적용해볼 수 있을 것 같아요.',
  '명확하게 설명해주셔서 이해가 잘 됩니다.',
];

const REPLY_CONTENTS = [
  '감사합니다! 도움이 되셨다니 기쁩니다.',
  '좋은 의견 감사드립니다.',
  '네, 추가 설명 드리자면...',
  '공감해주셔서 감사합니다!',
  '말씀하신 부분은 다음 글에서 다뤄보겠습니다.',
  '좋은 지적 감사합니다. 수정하겠습니다.',
  '네, 맞습니다. 정확히 이해하신 거에요.',
  '추가 질문 있으시면 언제든 댓글 남겨주세요!',
  '도움이 되셨다니 다행이네요.',
  '감사합니다. 앞으로도 좋은 글로 찾아뵙겠습니다!',
];

const STATUSES: PostCommentStatus[] = [
  'APPROVED',
  'APPROVED',
  'APPROVED',
  'APPROVED',
  'PENDING',
  'SPAM',
];

async function main() {
  // 1. 회원 정보 미리 로딩
  const users = await prisma.user.findMany({
    where: {
      id: { in: USER_IDS },
    },
  });

  if (users.length === 0) {
    console.error(
      '❌ USER_IDS 에 해당하는 User 가 없습니다. 먼저 회원을 생성해 주세요.',
    );
    return;
  }

  if (users.length < USER_IDS.length) {
    console.warn(
      `⚠️ USER_IDS 중 일부는 찾지 못했습니다. 실제 존재하는 ${users.length}명만 사용합니다.`,
    );
  }

  // 2. 블로그 포스트 확인 (postId 1, 2)
  const posts = await prisma.blogPost.findMany({
    where: {
      idx: { in: [1, 2] },
    },
    select: {
      idx: true,
      content: true,
    },
  });

  if (posts.length === 0) {
    console.error(
      '❌ BlogPost (idx: 1 또는 2)가 존재하지 않습니다. 먼저 포스트를 생성해 주세요.',
    );
    return;
  }

  console.log(`✅ ${posts.length}개의 포스트를 찾았습니다.`);

  // 3. 각 포스트마다 10~20개의 댓글 생성
  for (const post of posts) {
    const commentCount = randInt(10, 20);
    console.log(
      `\n📝 포스트 [${post.idx}] "${post.content.substring(0, 30)}..." - ${commentCount}개 댓글 생성 중...`,
    );

    const createdComments: number[] = []; // 생성된 댓글 idx 저장 (답글용)

    for (let i = 0; i < commentCount; i++) {
      const user = rand(users);
      const content = rand(COMMENT_CONTENTS);
      const status = rand(STATUSES);

      // 80% 확률로 1차 댓글, 20% 확률로 2차 답글
      const isReply = createdComments.length > 0 && Math.random() < 0.2;
      const parentIdx = isReply ? rand(createdComments) : null;
      const depth = isReply ? 2 : 1;
      const commentContent = isReply ? rand(REPLY_CONTENTS) : content;

      const comment = await prisma.blogPostComment.create({
        data: {
          postId: post.idx,
          userId: user.id,
          author: user.name,
          content: commentContent,
          status,
          ipAddress: `127.0.0.${randInt(1, 255)}`,
          parentIdx,
          depth,
          likeCount: randInt(0, 50),
          replyCount: 0, // 초기값, 나중에 답글 생성 시 업데이트
          isUse: true,
          isVisible: status === 'APPROVED' ? true : false,
        },
      });

      // 1차 댓글이면 저장 (나중에 답글 부모로 사용)
      if (!isReply) {
        createdComments.push(comment.idx);
      }

      // 답글이면 부모 댓글의 replyCount 증가
      if (isReply && parentIdx) {
        await prisma.blogPostComment.update({
          where: { idx: parentIdx },
          data: {
            replyCount: {
              increment: 1,
            },
          },
        });
      }

      const commentType = isReply ? '└─ 답글' : '댓글';
      console.log(
        `  ${commentType} [${comment.idx}] ${user.name}: ${commentContent.substring(0, 30)}... (status: ${status})`,
      );
    }

    // 4. 포스트의 commentCount 업데이트
    const totalComments = await prisma.blogPostComment.count({
      where: {
        postId: post.idx,
      },
    });

    await prisma.blogPost.update({
      where: { idx: post.idx },
      data: {
        commentCount: totalComments,
      },
    });

    console.log(
      `✅ 포스트 [${post.idx}] 댓글 생성 완료 (총 ${totalComments}개)`,
    );
  }

  console.log('\n🎉 블로그 댓글 시드 데이터 생성이 완료되었습니다.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
