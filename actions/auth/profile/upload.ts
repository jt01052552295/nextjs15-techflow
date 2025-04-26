'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getUserById } from '@/actions/user/info';
import { __ts, getDictionary } from '@/utils/get-dictionary';
import { ckLocale } from '@/lib/cookie';
import https from 'https';
import fetch from 'node-fetch';
type ReturnType = {
  status: string;
  message: string;
  data?: any;
};

// 응답 데이터의 타입 정의
interface UploadResponseData {
  status: string;
  files?: Array<{
    fileUrl: string;
    fileName: string;
  }>;
  profileEntries?: any[];
  [key: string]: any; // 기타 가능한 속성들
}

export const uploadAction = async (data: FormData): Promise<ReturnType> => {
  const language = await ckLocale();
  const missingFields = await __ts('common.form.missingFields', {}, language);

  const serialized = Object.fromEntries(data);

  if (!serialized.uid) {
    return {
      status: 'error',
      message: missingFields,
    };
  }

  const id = serialized.uid as string;

  const existingUserById = await getUserById(id);
  if (!existingUserById) {
    const notExistId = await __ts(
      'common.form.notExist',
      { column: id },
      language,
    );

    return {
      status: 'error',
      message: notExistId,
    };
  }

  const files = data.getAll('file[]') as File[];

  if (files.length === 0) {
    const no_file = await __ts('common.upload.no_file', {}, language);

    return {
      status: 'error',
      message: no_file,
    };
  }

  if (files.length > 4) {
    const max_count = await __ts(
      'common.upload.max_count',
      { max: 4 },
      language,
    );

    return {
      status: 'error',
      message: max_count,
    };
  }

  const fileSizeSum = files.reduce((sum, file) => sum + file.size, 0);
  const fileSizeMB = parseFloat((fileSizeSum / (1024 * 1024)).toFixed(2));

  if (fileSizeMB > 20.0) {
    const max_size = await __ts(
      'common.upload.max_size',
      { max: '20MB' },
      language,
    );

    return {
      status: 'error',
      message: max_size,
    };
  }
  try {
    if (!process.env.NEXT_PUBLIC_STATIC_SUBDOMAIN) {
      throw new Error('SUBDOMAIN is not defined');
    }

    const subdmoain = process.env.NEXT_PUBLIC_STATIC_SUBDOMAIN;
    const uploadUrl = process.env.NEXT_PUBLIC_STATIC_UPLOAD_URL;
    const NODE_ENV = process.env.NODE_ENV;

    const formData = new FormData();
    files.forEach((file) => {
      formData.append(`image[]`, file);
    });
    formData.append('domain', subdmoain);
    formData.append('dir', 'user');
    formData.append('pid', existingUserById.id);

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
        // UserProfile 테이블에 파일 정보 저장
        const profileEntries = await Promise.all(
          responseData.files.map(async (fileInfo: any) => {
            return await prisma.userProfile.create({
              data: {
                userId: existingUserById.id,
                name: fileInfo.fileName,
                url: fileInfo.fileUrl,
              },
            });
          }),
        );
        responseData.profileEntries = profileEntries;
      }
      const upload_success = await __ts('common.upload_success', {}, language);
      return { status: 'success', message: upload_success, data: responseData };

      // return { idx: 0, uid, todoId, name: fileName, url: fileUrl }
      //   responseData.files.forEach((fileInfo: any) => {
      //     const uid = uuidv4();
      //     fileInfos.push({
      //       idx: 0,
      //       uid,
      //       todoId,
      //       name: fileInfo.fileName,
      //       url: fileInfo.fileUrl,
      //     });
      //   });
    } else {
      const upload_error = await __ts('common.upload_error', {}, language);
      const errorText = await uploadResponse.text();
      console.error(
        `Upload failed with status: ${uploadResponse.status}, message: ${errorText}`,
      );
      throw new Error(upload_error);
    }
  } catch (error) {
    console.error('업로드 에러:', error);
    throw error;
    // const uid = uuidv4();
    // fileInfos.push({ idx: 0, uid, todoId, name: 'error', url: '' });
    // throw new Error(dictionary.common.upload_error)
  }
};

// 기존 UserProfile 정보를 삭제하는 함수 추가
export const deleteFileAction = async (
  profileId: string,
): Promise<ReturnType> => {
  const language = await ckLocale();
  const notExist = await __ts('common.form.notExist', {}, language);

  try {
    // 프로필 정보 조회
    const profile = await prisma.userProfile.findUnique({
      where: { uid: profileId },
      include: { User: true },
    });

    if (!profile) {
      return {
        status: 'error',
        message: notExist,
      };
    }

    // 프로필 정보 삭제
    await prisma.userProfile.delete({
      where: { uid: profileId },
    });

    // 업데이트된 경로 재검증
    // revalidatePath(`/admin/user/${profile.userId}`);
    // revalidatePath('/admin/user');
    const delete_success = await __ts('common.delete_success', {}, language);

    return {
      status: 'success',
      message: delete_success,
    };
  } catch (error) {
    const delete_error = await __ts('common.delete_error', {}, language);
    console.error('프로필 삭제 에러:', error);
    return {
      status: 'error',
      message: delete_error,
    };
  }
};
