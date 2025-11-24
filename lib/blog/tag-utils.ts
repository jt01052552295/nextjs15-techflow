import prisma from '@/lib/prisma';
import { IBlogTag } from '@/types/blog/tag';

/**
 * 데이터베이스에서 모든 카테고리를 가져옵니다
 */
export async function getAllTags(): Promise<IBlogTag[]> {
  return prisma.$queryRaw<IBlogTag[]>`
    SELECT *
    FROM \`ec_post_tag\`
    WHERE \`is_use\` = 1 AND \`is_visible\` = 1
    ORDER BY \`idx\` ASC
  `;
}
