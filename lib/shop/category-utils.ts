import prisma from '@/lib/prisma';
import { IShopCategory } from '@/types/shop/category';

/**
 * 부모 코드를 기반으로 새 카테고리 코드를 생성합니다
 * @param depth 부모 카테고리 코드
 * @returns 새 카테고리 코드 또는 오류 메시지
 */
export async function getCategoryCode(depth: string = ''): Promise<string> {
  const code = depth;
  const len = code.length;

  // 최대 깊이 도달 여부 확인 (3단계 = 8자)
  if (len === 8) {
    return '분류를 더 이상 추가할 수 없습니다. 3단계 분류까지만 가능합니다.';
  }

  const len2 = len + 1;

  // 원시 SQL 대신 Prisma를 사용하여 데이터베이스 쿼리
  // substring 기능이 필요하므로 raw query 사용
  const result = await prisma.$queryRaw<{ max_subid: string }[]>`
    SELECT MAX(SUBSTRING(code, ${len2}, 2)) as max_subid 
    FROM ec_shop_category 
    WHERE SUBSTRING(code, 1, ${len}) = ${code}
  `;

  // max_subid를 가져오거나 null인 경우 '00'으로 기본값 설정
  const maxSubid = result[0]?.max_subid || '00';

  // 36진수에서 10진수로 변환, 증가 후 오버플로우 처리
  let subid = parseInt(maxSubid, 36);
  subid += 1;

  if (subid >= 36 * 36) {
    throw new Error('분류를 더 이상 추가할 수 없습니다.');
  }

  // 다시 36진수로 변환하고 2자리로 패딩
  const newSubid = subid.toString(36).padStart(2, '0');

  // 새 코드 반환 (부모 + 새 서브카테고리 ID)
  return code + newSubid;
}

/**
 * 카테고리 코드의 차수(레벨)를 반환합니다
 * @param code 카테고리 코드
 * @returns 카테고리 차수 (1-3) 또는 0 (유효하지 않은 코드)
 */
export function getCategoryLevel(code: string): number {
  if (!code) return 0;

  const length = code.length;

  switch (length) {
    case 2:
      return 1; // 1차 카테고리 (예: "01")
    case 4:
      return 2; // 2차 카테고리 (예: "0101")
    case 6:
      return 3; // 3차 카테고리 (예: "010101")
    default:
      return 0; // 유효하지 않은 카테고리 코드
  }
}

/**
 * 데이터베이스에서 모든 카테고리를 가져옵니다
 */
export async function getAllCategories(): Promise<IShopCategory[]> {
  return prisma.$queryRaw<IShopCategory[]>`
    SELECT *
    FROM \`ec_shop_category\`
    WHERE \`is_use\` = 1 AND \`is_visible\` = 1
    ORDER BY \`code\` ASC
  `;
}

/**
 * 부모 카테고리의 하위 카테고리를 가져옵니다
 * @param parentCode 부모 카테고리 코드
 */
export async function getChildCategories(
  parentCode: string,
): Promise<IShopCategory[]> {
  const parentLength = parentCode.length;
  const childLength = parentLength + 2;

  return await prisma.$queryRaw<IShopCategory[]>`
      SELECT * FROM \`ec_shop_category\`; 
      WHERE \`is_use\` = 1 
      AND \`code\` LIKE ${parentCode + '%'} 
      AND \`code\` <> ${parentCode} 
      AND \`CHAR_LENGTH(code)\` = ${childLength} 
      ORDER BY \`code\` ASC
    `;
}
