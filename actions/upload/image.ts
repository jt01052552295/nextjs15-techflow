'use server';

import https from 'https';
import fetch from 'node-fetch';
import { ckLocale } from '@/lib/cookie';
import { __ts } from '@/utils/get-dictionary';

type UploadResult = {
  status: string;
  message: string;
  files?: Array<{
    fileUrl: string;
    fileName: string;
  }>;
};

// 응답 데이터의 타입 정의
interface UploadResponseData {
  status: string;
  files?: Array<{
    fileUrl: string;
    fileName: string;
  }>;
}

export const imageUploadAction = async (
  data: FormData,
  dir: string,
  pid: string,
): Promise<UploadResult> => {
  const language = await ckLocale();
  const missingFields = await __ts('common.form.missingFields', {}, language);
  const upload_error = await __ts('common.upload_error', {}, language);
  const MAX_FILE_SIZE = 2 * 1024 * 1024;

  try {
    const files = data.getAll('image[]') as File[];
    if (!files || files.length === 0) {
      return {
        status: 'error',
        message: missingFields,
      };
    }
    const oversizedFile = files.find((file) => file.size > MAX_FILE_SIZE);
    if (oversizedFile) {
      return {
        status: 'error',
        message: `"${oversizedFile.name}" 파일은 최대 2MB까지만 업로드 가능합니다.`,
      };
    }

    const subdmoain = process.env.NEXT_PUBLIC_STATIC_SUBDOMAIN!;
    const uploadUrl = process.env.NEXT_PUBLIC_STATIC_UPLOAD_URL!;
    const NODE_ENV = process.env.NODE_ENV;

    const formData = new FormData();
    for (const file of files) {
      formData.append('image[]', file);
    }
    formData.append('domain', subdmoain);
    formData.append('dir', dir);
    formData.append('pid', pid || '');

    const httpsAgent =
      NODE_ENV === 'development'
        ? new https.Agent({ rejectUnauthorized: false })
        : undefined;

    const uploadResponse = await fetch(uploadUrl, {
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
          files: responseData.files.map((fileInfo) => ({
            fileUrl: fileInfo.fileUrl,
            fileName: fileInfo.fileName,
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
  } catch (e) {
    console.error('서버 에러:', e);
    throw new Error(upload_error);
  }

  return {
    status: 'error',
    message: upload_error,
  };
};
