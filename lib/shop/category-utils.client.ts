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
