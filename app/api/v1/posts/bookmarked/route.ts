/**
 * GET /api/v1/posts/bookmarked - 북마크한 게시물 목록
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import { API_CODE } from '@/constants/api-code';
import * as PostService from '@/services_api/blog/post.service';

interface IApiResult<T = any> {
  success: boolean;
  code: string;
  message?: string;
  data?: T;
}

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await PostService.getBookmarkedPosts({
      cursor,
      limit,
      userId: session.id,
    });

    return NextResponse.json<IApiResult<typeof result>>(
      {
        success: true,
        code: API_CODE.SUCCESS.POSTS_FETCHED,
        data: result,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Get Bookmarked Posts Error:', error);
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
