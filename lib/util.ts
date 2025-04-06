type StringType =
  | 'numeric'
  | 'alphanumericLower'
  | 'alphanumericUpper'
  | 'lowercase'
  | 'uppercase'
  | 'alphabetic';

export const makeRandString = (
  length: number = 10,
  type: StringType = 'alphanumericLower',
): string => {
  let result = '';
  let characters = '';

  switch (type) {
    case 'numeric':
      characters = '0123456789';
      break;
    case 'alphanumericLower':
      characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
      break;
    case 'alphanumericUpper':
      characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      break;
    case 'lowercase':
      characters = 'abcdefghijklmnopqrstuvwxyz';
      break;
    case 'uppercase':
      characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      break;
    case 'alphabetic':
      characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
      break;
    default:
      characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      break;
  }

  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

export const maskingName = (str: string | null): string => {
  if (str === null) {
    return '';
  }
  const length = str.length;
  const firstChar = str.charAt(0);
  let maskedName = '';

  for (let i = 1; i < length; i++) {
    maskedName += '*';
  }

  return firstChar + maskedName;
};

export const maskingEmail = (email: string | null): string => {
  if (email === null) {
    return '';
  }
  const em = email.split('@');
  const name = em.slice(0, em.length - 1).join('@');
  const domain = em[em.length - 1];

  const len = Math.floor(name.length / 2);
  const maskedName = name.substring(0, len) + '*'.repeat(len);

  const domainParts = domain.split('.');
  const domainName = domainParts[0];
  const domainExtension = domainParts.slice(1).join('.');

  const maskedDomain =
    domainName.charAt(0) +
    '*'.repeat(domainName.length - 1) +
    '.' +
    domainExtension;

  return maskedName + '@' + maskedDomain;
};

type FormatMessageParams = Record<string, string | number>;

export const formatMessage = (
  template: string | undefined,
  params: FormatMessageParams,
  defaultMessage = 'Translation not available',
): string => {
  if (!template) {
    console.warn('[Translation] Template is undefined, using default message');
    return defaultMessage;
  }

  try {
    return template.replace(/{(\w+)}/g, (match, key) => {
      if (!(key in params)) {
        console.warn(`[Translation] Missing parameter "${key}" in template`);
        return match;
      }
      return String(params[key]);
    });
  } catch (error) {
    console.error('[Translation] Error:', error);
    return defaultMessage;
  }
};

export function formatToDateTimeLocal(date: Date): string {
  const pad = (num: number) => String(num).padStart(2, '0');
  return (
    [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join(
      '-',
    ) +
    'T' +
    [pad(date.getHours()), pad(date.getMinutes())].join(':')
  );
}

export const extractFileName = (url: string): string => {
  return url.substring(url.lastIndexOf('/') + 1);
};

// 절전율
export function calculatePercentageDifference(
  kepco: number,
  iot: number,
): string | number {
  if (iot === 0 || kepco === 0) {
    return '-'; // 적산자료가 0일 경우 나눗셈 오류를 방지
  }

  const percentageDifference = ((kepco - iot) / kepco) * 100;

  return Math.round(percentageDifference * 100) / 100; // 소수점 둘째자리까지 반올림
}

//증감율
export function calculateChangeRate(
  totalPower: number,
  previousTotalPower: number,
  kepcoPower: number,
  previousKepcoPower: number,
  index: number,
): { powerDifference: string | number; kepcoDifference: string | number } {
  let powerDifference: string | number = '-';
  let kepcoDifference: string | number = '-';

  if (index > 0 && totalPower && kepcoPower) {
    powerDifference = previousTotalPower
      ? ((totalPower - previousTotalPower) / previousTotalPower) * 100
      : 0;
    kepcoDifference = previousKepcoPower
      ? ((kepcoPower - previousKepcoPower) / previousKepcoPower) * 100
      : 0;

    if (typeof powerDifference === 'number') {
      powerDifference = powerDifference.toFixed(2);
    }

    if (typeof kepcoDifference === 'number') {
      kepcoDifference = kepcoDifference.toFixed(2);
    }
  }

  return { powerDifference, kepcoDifference };
}

// 파일 확장자 추출 함수
export const getFileExtension = (filename: string): string => {
  return filename
    .slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2)
    .toLowerCase();
};

// 허용된 파일 타입 목록을 사람이 읽기 쉬운 형식으로 변환
export const getAcceptableFileTypes = (accept: string): string => {
  const types = accept.split(',').map((type) => type.trim());
  const extensions = types.map((type) => {
    if (type === 'image/*') return 'images';
    if (type === 'application/pdf') return 'PDF';
    if (type.startsWith('.')) return type.substring(1).toUpperCase();
    return type;
  });

  return extensions.join(', ');
};

// 파일 타입 검증 함수 개선
export const isValidFileType = (file: File, accept: string): boolean => {
  const acceptTypes = accept.split(',').map((type) => type.trim());

  // 파일 확장자 확인
  const fileExt = getFileExtension(file.name);
  const acceptableExts = acceptTypes
    .filter((type) => type.startsWith('.'))
    .map((type) => type.substring(1).toLowerCase());

  // MIME 타입 확인
  const acceptableMimeTypes = acceptTypes.filter(
    (type) => !type.startsWith('.'),
  );

  // 확장자 체크
  if (acceptableExts.includes(fileExt)) {
    return true;
  }

  // MIME 타입 체크
  return acceptableMimeTypes.some((type) => {
    if (type === '*' || type === '*/*') return true;

    if (type.endsWith('/*')) {
      const mainType = type.split('/')[0];
      return file.type.startsWith(`${mainType}/`);
    }

    return file.type === type;
  });
};
