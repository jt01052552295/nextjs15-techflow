import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import { API_CODE } from '@/constants/api-code';
import prisma from '@/lib/prisma';
import {
  IUserProfileUpdateRequest,
  IUserProfileUpdateResult,
  USER_PROFILE_VALIDATION,
} from '@/types_api/user';

/**
 * URL 형식 검증 함수
 */
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * PATCH /api/v1/users/profile
 * 프로필 정보 수정 (name, bio, location, website)
 */
export async function PATCH(request: Request) {
  try {
    const user = await getAuthSession();

    if (!user) {
      return NextResponse.json<IUserProfileUpdateResult>(
        {
          success: false,
          code: API_CODE.ERROR.UNAUTHORIZED,
          message: '인증되지 않은 사용자입니다.',
        },
        { status: 401 },
      );
    }

    const body = (await request.json()) as IUserProfileUpdateRequest;
    const { name, bio, location, website } = body;

    // 유효성 검사
    // 1. name 검증 (2-50자)
    if (name !== undefined) {
      if (
        name.length < USER_PROFILE_VALIDATION.name.min ||
        name.length > USER_PROFILE_VALIDATION.name.max
      ) {
        return NextResponse.json<IUserProfileUpdateResult>(
          {
            success: false,
            code: API_CODE.ERROR.INVALID_NAME_LENGTH,
            message: `이름은 ${USER_PROFILE_VALIDATION.name.min}-${USER_PROFILE_VALIDATION.name.max}자 사이여야 합니다.`,
          },
          { status: 400 },
        );
      }
    }

    // 2. bio 검증 (최대 160자)
    if (bio !== undefined && bio.length > USER_PROFILE_VALIDATION.bio.max) {
      return NextResponse.json<IUserProfileUpdateResult>(
        {
          success: false,
          code: API_CODE.ERROR.INVALID_BIO_LENGTH,
          message: `자기소개는 최대 ${USER_PROFILE_VALIDATION.bio.max}자까지 가능합니다.`,
        },
        { status: 400 },
      );
    }

    // 3. location 검증 (최대 30자)
    if (
      location !== undefined &&
      location.length > USER_PROFILE_VALIDATION.location.max
    ) {
      return NextResponse.json<IUserProfileUpdateResult>(
        {
          success: false,
          code: API_CODE.ERROR.INVALID_LOCATION_LENGTH,
          message: `위치는 최대 ${USER_PROFILE_VALIDATION.location.max}자까지 가능합니다.`,
        },
        { status: 400 },
      );
    }

    // 4. website 검증 (URL 형식, 최대 100자)
    if (website !== undefined && website !== '') {
      if (website.length > USER_PROFILE_VALIDATION.website.max) {
        return NextResponse.json<IUserProfileUpdateResult>(
          {
            success: false,
            code: API_CODE.ERROR.INVALID_WEBSITE_LENGTH,
            message: `웹사이트는 최대 ${USER_PROFILE_VALIDATION.website.max}자까지 가능합니다.`,
          },
          { status: 400 },
        );
      }

      if (!isValidUrl(website)) {
        return NextResponse.json<IUserProfileUpdateResult>(
          {
            success: false,
            code: API_CODE.ERROR.INVALID_WEBSITE_FORMAT,
            message:
              '올바른 URL 형식이 아닙니다. (http:// 또는 https://로 시작)',
          },
          { status: 400 },
        );
      }
    }

    // 업데이트할 데이터 구성
    const updateData: {
      name?: string;
      bio?: string | null;
      location?: string | null;
      website?: string | null;
    } = {};

    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio || null;
    if (location !== undefined) updateData.location = location || null;
    if (website !== undefined) updateData.website = website || null;

    // DB 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        name: true,
        nick: true,
        bio: true,
        location: true,
        website: true,
        profileImage: true,
        bannerImage: true,
      },
    });

    return NextResponse.json<IUserProfileUpdateResult>(
      {
        success: true,
        code: API_CODE.SUCCESS.USER_PROFILE_UPDATED,
        data: updatedUser,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Update Profile Error:', error);
    return NextResponse.json<IUserProfileUpdateResult>(
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
 * GET /api/v1/users/profile
 * 내 프로필 정보 조회
 */
export async function GET() {
  try {
    const user = await getAuthSession();

    if (!user) {
      return NextResponse.json<IUserProfileUpdateResult>(
        {
          success: false,
          code: API_CODE.ERROR.UNAUTHORIZED,
          message: '인증되지 않은 사용자입니다.',
        },
        { status: 401 },
      );
    }

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        name: true,
        nick: true,
        bio: true,
        location: true,
        website: true,
        profileImage: true,
        bannerImage: true,
      },
    });

    if (!profile) {
      return NextResponse.json<IUserProfileUpdateResult>(
        {
          success: false,
          code: API_CODE.ERROR.USER_NOT_FOUND,
          message: '사용자를 찾을 수 없습니다.',
        },
        { status: 404 },
      );
    }

    return NextResponse.json<IUserProfileUpdateResult>(
      {
        success: true,
        code: API_CODE.SUCCESS.USER_PROFILE_UPDATED,
        data: profile,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Get Profile Error:', error);
    return NextResponse.json<IUserProfileUpdateResult>(
      {
        success: false,
        code: API_CODE.ERROR.SERVER_ERROR,
        message: '서버 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
