'use client';

import { getValueByPath, replaceVariables } from './translation-utils';
import type { Dictionary } from './translation-utils';

/**
 * 클라이언트 컴포넌트용 번역 함수
 * 미리 로드된 사전 데이터를 사용합니다.
 * @param key 번역 키
 * @param variables 치환할 변수
 * @param dictionary 사전 데이터
 * @returns 번역된 텍스트 또는 빈 문자열
 */
export const translateClient = (
  key: string,
  variables?: Record<string, any>,
  dictionary?: Dictionary,
): string => {
  try {
    if (!dictionary) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          '[i18n] Dictionary not provided for translateClient() function',
        );
      }
      return '';
    }

    // 키에 네임스페이스가 포함되어 있는지 확인
    let fullKey = key;
    if (!key.includes('.')) {
      // 기본적으로 common 네임스페이스 사용
      fullKey = `common.${key}`;
    }

    // 값 가져오기
    const value = getValueByPath(dictionary, fullKey);

    // 값이 없으면 빈 문자열 반환
    if (value === undefined || value === null) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[i18n] Translation key not found: ${fullKey}`);
      }
      return '';
    }

    // 변수 치환 후 반환
    return replaceVariables(value, variables);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[i18n] Translation error for key: ${key}`, error);
    }
    return '';
  }
};

// 기존 함수 이름 유지 (하위 호환성)
export const __tc = translateClient;
