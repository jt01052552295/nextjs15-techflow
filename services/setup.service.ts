import prisma from '@/lib/prisma';

import type { ISetup } from '@/types/setup';
import type { CreateType } from '@/actions/setup/create/schema';
import { revalidateTag } from 'next/cache';
export const SETUP_TAG = 'setup';

// undefined만 제외(빈문자열/false/null은 그대로 반영)
const pickDefined = <T extends Record<string, any>>(obj: T) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

/** 보기 */
export async function show(uid: string): Promise<ISetup> {
  // 먼저 존재 확인 (선택)
  // const exists = await prisma.setup.findUnique({
  //   where: { uid },
  //   select: { uid: true },
  // });
  // if (!exists) throw new Error('NOT_FOUND');

  const rs = await prisma.setup.findUnique({
    where: { uid },
  });

  // if (!rs) throw new Error('NOT_FOUND');
  return rs as ISetup;
}

/** 작성 */
export async function upsert(input: CreateType) {
  const {
    uid,
    isDefault = false,
    snsFacebook,
    snsTwitter,
    snsInstagram,
    snsYoutube,
    snsLinkedin,
    snsKakao,
    snsNaver,
    idFilter,
    wordFilter,
    possibleIp,
    interceptIp,
    aosVersion,
    aosUpdate,
    aosStoreApp,
    aosStoreWeb,
    iosVersion,
    iosUpdate,
    iosStoreApp,
    iosStoreWeb,
    jsCssVer,
    isUse = true,
    isVisible = true,
  } = input;

  const createData = {
    uid,
    isDefault,
    // SNS
    snsFacebook,
    snsTwitter,
    snsInstagram,
    snsYoutube,
    snsLinkedin,
    snsKakao,
    snsNaver,
    // 필터/접근 제어
    idFilter,
    wordFilter,
    possibleIp,
    interceptIp,
    // Android
    aosVersion,
    aosUpdate,
    aosStoreApp,
    aosStoreWeb,
    // iOS
    iosVersion,
    iosUpdate,
    iosStoreApp,
    iosStoreWeb,
    // 정적 리소스 버전
    jsCssVer,
    // 메타
    isUse,
    isVisible,
  };

  const updateData = pickDefined({
    isDefault,
    // SNS
    snsFacebook,
    snsTwitter,
    snsInstagram,
    snsYoutube,
    snsLinkedin,
    snsKakao,
    snsNaver,
    // 필터/접근 제어
    idFilter,
    wordFilter,
    possibleIp,
    interceptIp,
    // Android
    aosVersion,
    aosUpdate,
    aosStoreApp,
    aosStoreWeb,
    // iOS
    iosVersion,
    iosUpdate,
    iosStoreApp,
    iosStoreWeb,
    // 정적 리소스 버전
    jsCssVer,
    isUse,
    isVisible,
  });

  // 기본행 단일 보장: isDefault=true로 저장 시, 나머지 모두 false로 내림
  const row = await prisma.$transaction(async (tx) => {
    if (isDefault === true) {
      await tx.setup.updateMany({
        where: { uid: { not: uid } },
        data: { isDefault: false },
      });
    }

    const saved = await tx.setup.upsert({
      where: { uid }, // uid는 @unique
      create: createData,
      update: updateData,
    });

    return saved;
  });

  revalidateTag(SETUP_TAG);
  // (선택) 특정 경로도 무효화하고 싶다면
  // revalidatePath('/[language]/setup'); // 필요 시

  return row;
}

/** 버전 체크 (앱용) */
export async function getVersionInfo() {
  const setup = await prisma.setup.findFirst({
    where: { isDefault: true },
    select: {
      aosVersion: true,
      aosUpdate: true,
      aosStoreApp: true,
      aosStoreWeb: true,
      iosVersion: true,
      iosUpdate: true,
      iosStoreApp: true,
      iosStoreWeb: true,
    },
  });

  if (!setup) {
    return null;
  }

  return {
    android: {
      ver: setup.aosVersion || '',
      update: parseInt(setup.aosUpdate || '1', 10),
      store: {
        app: setup.aosStoreApp || '',
        web: setup.aosStoreWeb || '',
      },
    },
    ios: {
      ver: setup.iosVersion || '',
      update: parseInt(setup.iosUpdate || '1', 10),
      store: {
        app: setup.iosStoreApp || '',
        web: setup.iosStoreWeb || '',
      },
    },
  };
}
