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

export const formatMessage = (
  template: string | undefined,
  params: Record<string, string>,
  defaultMessage = 'Translation not available',
): string => {
  const resolvedTemplate = template || defaultMessage;

  return resolvedTemplate.replace(/{(\w+)}/g, (_, key) => params[key] || '');
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
