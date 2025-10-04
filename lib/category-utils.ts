import prisma from '@/lib/prisma';

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
    FROM ec_category 
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
 * 데이터베이스에서 모든 카테고리를 가져옵니다
 */
export async function getAllCategories() {
  return await prisma.$queryRaw`
      SELECT * FROM ec_category 
      WHERE is_use = true AND is_visible = true 
      ORDER BY code ASC
    `;
}

/**
 * 부모 카테고리의 하위 카테고리를 가져옵니다
 * @param parentCode 부모 카테고리 코드
 */
export async function getChildCategories(parentCode: string) {
  const parentLength = parentCode.length;
  const childLength = parentLength + 2;

  return await prisma.$queryRaw`
      SELECT * FROM ec_category 
      WHERE is_use = true 
      AND code LIKE ${parentCode + '%'} 
      AND code <> ${parentCode} 
      AND CHAR_LENGTH(code) = ${childLength} 
      ORDER BY code ASC
    `;
}
