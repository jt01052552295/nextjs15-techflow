// 서버와 클라이언트 모두에서 사용할 수 있는 공통 유틸리티

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Dictionary = Record<string, any>;

/**
 * 점 표기법으로 된 경로를 통해 객체에서 값을 가져오는 함수
 * @param obj 객체
 * @param path 점 표기법 경로 (예: 'common.AppName')
 * @returns 찾은 값 또는 undefined
 */
export const getValueByPath = (obj: Dictionary, path: string): any => {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (current === undefined || current === null) {
      return undefined;
    }
    current = current[key];
  }

  return current;
};

/**
 * 변수를 치환하는 함수
 * @param text 텍스트 (예: '안녕하세요, {name}')
 * @param variables 변수 객체 (예: { name: '홍길동' })
 * @returns 치환된 텍스트
 */
export const replaceVariables = (
  text: string,
  variables?: Record<string, any>,
): string => {
  if (!variables || typeof text !== 'string') {
    return String(text || '');
  }

  return text.replace(/{([^{}]+)}/g, (match, key) => {
    const value = variables[key];
    return value !== undefined ? String(value) : match;
  });
};
