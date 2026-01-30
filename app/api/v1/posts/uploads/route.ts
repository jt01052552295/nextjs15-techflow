/**
 * POST /api/v1/posts/uploads
 * 게시물 이미지 업로드 (선행 업로드)
 */

import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import { API_CODE } from '@/constants/api-code';

interface IApiResult<T = any> {
  success: boolean;
  code: string;
  message?: string;
  data?: T;
}

// 이미지 제한
const MAX_FILES = 4;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json<IApiResult<null>>(
        {
          success: false,
          code: API_CODE.ERROR.UNAUTHORIZED,
          message: '인증되지 않은 사용자입니다.',
        },
        { status: 401 },
      );
    }

    const formData = await request.formData();

    // 모든 파일 수집 (key가 'files' 또는 'files[]' 또는 'file' 등 다양한 경우 처리)
    const files: File[] = [];
    for (const [, value] of formData.entries()) {
      // File 객체인지 확인 (Blob이고 name 속성이 있으면 File)
      if (value instanceof File && value.size > 0) {
        files.push(value);
      }
    }

    console.log('[Upload] Received files count:', files.length);
    console.log(
      '[Upload] File names:',
      files.map((f) => f.name),
    );

    if (!files || files.length === 0) {
      return NextResponse.json<IApiResult<null>>(
        {
          success: false,
          code: API_CODE.ERROR.NO_FILE_PROVIDED,
          message: '업로드할 파일이 없습니다.',
        },
        { status: 400 },
      );
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json<IApiResult<null>>(
        {
          success: false,
          code: API_CODE.ERROR.INVALID_REQUEST,
          message: `최대 ${MAX_FILES}개의 이미지만 업로드할 수 있습니다.`,
        },
        { status: 400 },
      );
    }

    // 파일 유효성 검사
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json<IApiResult<null>>(
          {
            success: false,
            code: API_CODE.ERROR.INVALID_FILE_TYPE,
            message: 'jpg, png, webp 형식만 업로드 가능합니다.',
          },
          { status: 400 },
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json<IApiResult<null>>(
          {
            success: false,
            code: API_CODE.ERROR.FILE_TOO_LARGE,
            message: '파일 크기는 5MB를 초과할 수 없습니다.',
          },
          { status: 400 },
        );
      }
    }

    // Static 서버로 업로드 (한 번의 요청에 모든 파일 전송)
    const staticDomain =
      process.env.NEXT_PUBLIC_STATIC_DOMAIN || 'https://static.vaion.co.kr';
    const uploadEndpoint =
      process.env.STATIC_UPLOAD_ENDPOINT || 'https://static.vaion.co.kr/upload';

    const uploadFormData = new FormData();
    // 모든 파일을 'image[]' 배열로 추가
    for (const file of files) {
      uploadFormData.append('image[]', file);
    }
    uploadFormData.append('domain', 'admin');
    uploadFormData.append('dir', 'posts');
    uploadFormData.append('pid', session.id);

    let uploadedUrls: string[] = [];

    try {
      const uploadResponse = await fetch(uploadEndpoint, {
        method: 'POST',
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        console.error('Upload failed:', await uploadResponse.text());
        return NextResponse.json<IApiResult<null>>(
          {
            success: false,
            code: API_CODE.ERROR.UPLOAD_FAILED,
            message: '이미지 업로드에 실패했습니다.',
          },
          { status: 500 },
        );
      }

      const result = await uploadResponse.json();
      console.log('[Upload] Static server response:', JSON.stringify(result));

      // static 서버 응답: { status: 'success', files: [{ fileUrl, fileName, originalName }, ...] }
      if (
        result.status === 'success' &&
        result.files &&
        result.files.length > 0
      ) {
        uploadedUrls = result.files.map((f: { fileUrl: string }) => {
          const fileUrl = f.fileUrl;
          return fileUrl.startsWith('http')
            ? fileUrl
            : `${staticDomain}${fileUrl}`;
        });
      }
    } catch (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json<IApiResult<null>>(
        {
          success: false,
          code: API_CODE.ERROR.UPLOAD_FAILED,
          message: '이미지 업로드에 실패했습니다.',
        },
        { status: 500 },
      );
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json<IApiResult<null>>(
        {
          success: false,
          code: API_CODE.ERROR.UPLOAD_FAILED,
          message: '이미지 업로드에 실패했습니다.',
        },
        { status: 500 },
      );
    }

    return NextResponse.json<IApiResult<{ urls: string[] }>>(
      {
        success: true,
        code: API_CODE.SUCCESS.POST_IMAGES_UPLOADED,
        data: { urls: uploadedUrls },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Post Image Upload Error:', error);
    return NextResponse.json<IApiResult<null>>(
      {
        success: false,
        code: API_CODE.ERROR.SERVER_ERROR,
        message: '서버 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
