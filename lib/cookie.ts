'use server';
import { cookies } from 'next/headers';
import { LocaleType } from '@/types/locales';

export const ckLocale = async () => {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('ck_locale');
  const ck_locale = localeCookie?.value || 'ko'; // 기본 로케일 설정

  return ck_locale as LocaleType;
};
