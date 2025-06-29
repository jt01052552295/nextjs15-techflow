'use server';

import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
import { cookies } from 'next/headers';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
import { __ts, getDictionary } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';
import https from 'https';
import fetch from 'node-fetch';
type UploadReturnType = {
  status: string;
  message: string;
  output?: any;
};

// 응답 데이터의 타입 정의
interface UploadResponseData {
  status: string;
  files?: Array<{
    fileUrl: string;
    fileName: string;
  }>;
}

export const editorUploadAction = async (
  data: FormData,
): Promise<UploadReturnType> => {
  const language = await ckLocale();
  const dictionary = await getDictionary(language);
  const missingFields = await __ts('common.form.missingFields', {}, language);
  const upload_error = await __ts('common.upload_error', {}, language);

  const serialized = Object.fromEntries(data);
  const date = dayjs(new Date().getTime()).format('YYYYMMDD');

  const files = data.getAll('image') as File[];

  if (files.length === 0) {
    return {
      status: 'error',
      message: missingFields,
    };
  }

  const uid = uuidv4();

  if (!process.env.NEXT_PUBLIC_STATIC_SUBDOMAIN) {
    throw new Error('NEXT_PUBLIC_STATIC_SUBDOMAIN is not defined');
  }

  const subdmoain = process.env.NEXT_PUBLIC_STATIC_SUBDOMAIN;
  const uploadUrl = process.env.NEXT_PUBLIC_STATIC_EDITOR_URL;
  const NODE_ENV = process.env.NODE_ENV;

  try {
    const formData = new FormData();
    for (const file of files) {
      formData.append('image', file); // 여러개 append
    }
    formData.append('domain', subdmoain);
    formData.append('dir', date);

    // console.log([...formData.entries()])

    // HTTPS 인증서 검증을 무시하는 agent 설정 (개발모드일때)
    const httpsAgent =
      NODE_ENV === 'development'
        ? new https.Agent({ rejectUnauthorized: false })
        : undefined;

    const uploadResponse = await fetch(`${uploadUrl}`, {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
      agent: httpsAgent as any,
    });

    if (uploadResponse.ok) {
      const responseData = (await uploadResponse.json()) as UploadResponseData;
      console.log(responseData);
      if (
        responseData.status === 'success' &&
        responseData.files &&
        responseData.files.length > 0
      ) {
        return {
          status: 'success',
          message: 'upload ok!',
          output: responseData.files.map((fileInfo) => ({
            url: process.env.NEXT_PUBLIC_STATIC_URL + fileInfo.fileUrl,
          })),
        };
      }
    } else {
      const errorText = await uploadResponse.text();
      console.error(
        `Upload failed with status: ${uploadResponse.status}, message: ${errorText}`,
      );

      throw new Error(upload_error);
    }
  } catch (error) {
    console.error('업로드 에러:', error);
    throw new Error(upload_error);
  }

  return {
    status: 'error',
    message: upload_error,
  };
};
