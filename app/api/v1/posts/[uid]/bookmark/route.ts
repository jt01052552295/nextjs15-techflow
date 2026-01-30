/**
 * POST /api/v1/posts/:uid/bookmark - 북마크 토글
 */

import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import { API_CODE } from '@/constants/api-code';
import * as PostService from '@/services_api/blog/post.service';

interface IApiResult<T = any> {
  success: boolean;
  code: string;
  message?: string;
  data?: T;
}

interface RouteParams {
  params: Promise<{ uid: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
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

    const { uid } = await params;
    const result = await PostService.toggleBookmark(uid, session.id);

    if (!result) {
      return NextResponse.json<IApiResult<null>>(
        {
          success: false,
          code: API_CODE.ERROR.POST_NOT_FOUND,
          message: '게시물을 찾을 수 없습니다.',
        },
        { status: 404 },
      );
    }

    return NextResponse.json<IApiResult<typeof result>>(
      {
        success: true,
        code: API_CODE.SUCCESS.POST_BOOKMARK_TOGGLED,
        data: result,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Toggle Bookmark Error:', error);
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
