import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import { API_CODE } from '@/constants/api-code';
import prisma from '@/lib/prisma';
import https from 'https';
import {
  IUserImageUploadResult,
  IUserImageDeleteResult,
  UserImageType,
  USER_IMAGE_CONFIG,
  ALLOWED_IMAGE_TYPES,
} from '@/types_api/user';
import { getFullImageUrl } from '@/lib/util';

/**
 * static 서버에 이미지 업로드
 */
async function uploadToStaticServer(
  file: File,
  userId: string,
  imageType: UserImageType,
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  try {
    const subdomain = process.env.NEXT_PUBLIC_STATIC_SUBDOMAIN;
    const uploadUrl = process.env.NEXT_PUBLIC_STATIC_UPLOAD_URL;
    const NODE_ENV = process.env.NODE_ENV;

    if (!subdomain || !uploadUrl) {
      return { success: false, error: '업로드 서버 설정이 없습니다.' };
    }

    // 파일명 생성: profile_1706500000.jpg 또는 banner_1706500000.jpg
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const timestamp = Date.now();
    const newFileName = `${imageType}_${timestamp}.${ext}`;

    // 파일을 새 이름으로 변환
    const renamedFile = new File([file], newFileName, { type: file.type });

    const formData = new FormData();
    formData.append('image[]', renamedFile);
    formData.append('domain', subdomain);
    formData.append('dir', 'profile'); // /files/profile/{userId}/ 경로
    formData.append('pid', userId);

    // HTTPS 인증서 검증을 무시하는 agent 설정 (개발모드일때)
    const httpsAgent =
      NODE_ENV === 'development'
        ? new https.Agent({ rejectUnauthorized: false })
        : undefined;

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
      },
      // @ts-expect-error - node-fetch agent type
      agent: httpsAgent,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Static server upload failed:', errorText);
      return { success: false, error: '업로드 서버 오류' };
    }

    const result = (await response.json()) as {
      status: string;
      files?: Array<{ fileUrl: string; fileName: string }>;
    };

    if (
      result.status === 'success' &&
      result.files &&
      result.files.length > 0
    ) {
      return { success: true, url: result.files[0].fileUrl };
    }

    return { success: false, error: '업로드 응답 형식 오류' };
  } catch (error) {
    console.error('Upload to static server error:', error);
    return { success: false, error: '업로드 중 오류 발생' };
  }
}

/**
 * POST /api/v1/users/images
 * 프로필 또는 배너 이미지 업로드
 */
export async function POST(request: Request) {
  try {
    const user = await getAuthSession();

    if (!user) {
      return NextResponse.json<IUserImageUploadResult>(
        {
          success: false,
          code: API_CODE.ERROR.UNAUTHORIZED,
          message: '인증되지 않은 사용자입니다.',
        },
        { status: 401 },
      );
    }

    // FormData 파싱
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string | null;

    // 1. type 검증
    if (!type || (type !== 'profile' && type !== 'banner')) {
      return NextResponse.json<IUserImageUploadResult>(
        {
          success: false,
          code: API_CODE.ERROR.INVALID_IMAGE_TYPE,
          message: "type은 'profile' 또는 'banner'여야 합니다.",
        },
        { status: 400 },
      );
    }

    const imageType = type as UserImageType;

    // 2. 파일 존재 검증
    if (!file || !(file instanceof File)) {
      return NextResponse.json<IUserImageUploadResult>(
        {
          success: false,
          code: API_CODE.ERROR.NO_FILE_PROVIDED,
          message: '파일이 제공되지 않았습니다.',
        },
        { status: 400 },
      );
    }

    // 3. 파일 형식 검증 (jpg, png, webp만 허용 - gif 제외)
    if (
      !ALLOWED_IMAGE_TYPES.includes(
        file.type as (typeof ALLOWED_IMAGE_TYPES)[number],
      )
    ) {
      return NextResponse.json<IUserImageUploadResult>(
        {
          success: false,
          code: API_CODE.ERROR.INVALID_FILE_TYPE,
          message: '지원하지 않는 파일 형식입니다. (jpg, png, webp만 가능)',
        },
        { status: 400 },
      );
    }

    // 4. 파일 용량 검증
    const config = USER_IMAGE_CONFIG[imageType];
    if (file.size > config.maxSize) {
      return NextResponse.json<IUserImageUploadResult>(
        {
          success: false,
          code: API_CODE.ERROR.FILE_TOO_LARGE,
          message: `${imageType === 'profile' ? '프로필' : '배너'} 이미지는 ${config.maxSizeLabel} 이하여야 합니다.`,
        },
        { status: 400 },
      );
    }

    // 5. static 서버에 업로드
    const uploadResult = await uploadToStaticServer(file, user.id, imageType);

    if (!uploadResult.success) {
      return NextResponse.json<IUserImageUploadResult>(
        {
          success: false,
          code: API_CODE.ERROR.UPLOAD_FAILED,
          message: uploadResult.error,
        },
        { status: 500 },
      );
    }

    const imageUrl = uploadResult.url;
    const fullImageUrl = getFullImageUrl(imageUrl);

    if (!imageUrl || fullImageUrl === null) {
      return NextResponse.json<IUserImageUploadResult>(
        {
          success: false,
          code: API_CODE.ERROR.UPLOAD_FAILED,
          message: '업로드된 파일 URL을 가져올 수 없습니다.',
        },
        { status: 500 },
      );
    }

    // 6. DB 업데이트
    const updateField =
      imageType === 'profile' ? 'profileImage' : 'bannerImage';
    await prisma.user.update({
      where: { id: user.id },
      data: { [updateField]: imageUrl },
    });

    return NextResponse.json<IUserImageUploadResult>(
      {
        success: true,
        code: API_CODE.SUCCESS.USER_IMAGE_UPLOADED,
        data: {
          url: fullImageUrl,
          type: imageType,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Upload Image Error:', error);
    return NextResponse.json<IUserImageUploadResult>(
      {
        success: false,
        code: API_CODE.ERROR.SERVER_ERROR,
        message: '서버 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/v1/users/images
 * 프로필 또는 배너 이미지 삭제
 */
export async function DELETE(request: Request) {
  try {
    const user = await getAuthSession();

    if (!user) {
      return NextResponse.json<IUserImageDeleteResult>(
        {
          success: false,
          code: API_CODE.ERROR.UNAUTHORIZED,
          message: '인증되지 않은 사용자입니다.',
        },
        { status: 401 },
      );
    }

    const body = (await request.json()) as { type?: string };
    const { type } = body;

    // type 검증
    if (!type || (type !== 'profile' && type !== 'banner')) {
      return NextResponse.json<IUserImageDeleteResult>(
        {
          success: false,
          code: API_CODE.ERROR.INVALID_IMAGE_TYPE,
          message: "type은 'profile' 또는 'banner'여야 합니다.",
        },
        { status: 400 },
      );
    }

    // DB에서 이미지 URL 제거
    const updateField = type === 'profile' ? 'profileImage' : 'bannerImage';
    await prisma.user.update({
      where: { id: user.id },
      data: { [updateField]: null },
    });

    // TODO: static 서버에서 실제 파일 삭제 (선택적)
    // 현재는 DB 참조만 제거

    return NextResponse.json<IUserImageDeleteResult>(
      {
        success: true,
        code: API_CODE.SUCCESS.USER_IMAGE_DELETED,
        data: null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Delete Image Error:', error);
    return NextResponse.json<IUserImageDeleteResult>(
      {
        success: false,
        code: API_CODE.ERROR.SERVER_ERROR,
        message: '서버 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
