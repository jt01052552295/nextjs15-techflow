/**
 * GET  /api/v1/posts - 피드 목록
 * POST /api/v1/posts - 게시물 작성
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import { API_CODE } from '@/constants/api-code';
import * as PostService from '@/services_api/blog/post.service';
import type { IPostCreateRequest } from '@/types_api/posts';

interface IApiResult<T = any> {
  success: boolean;
  code: string;
  message?: string;
  data?: T;
}

// 게시물 제한
const MAX_CONTENT_LENGTH = 280;

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

    const result = await PostService.getPosts({
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
    console.error('Get Posts Error:', error);
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

    const body = (await request.json()) as IPostCreateRequest;
    const { content, imageUrls, visibility } = body;

    // 유효성 검사
    if (!content || content.trim().length === 0) {
      return NextResponse.json<IApiResult<null>>(
        {
          success: false,
          code: API_CODE.ERROR.CONTENT_REQUIRED,
          message: '내용을 입력해주세요.',
        },
        { status: 400 },
      );
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json<IApiResult<null>>(
        {
          success: false,
          code: API_CODE.ERROR.CONTENT_TOO_LONG,
          message: `내용은 ${MAX_CONTENT_LENGTH}자를 초과할 수 없습니다.`,
        },
        { status: 400 },
      );
    }

    const post = await PostService.createPost(session.id, {
      content: content.trim(),
      imageUrls,
      visibility,
    });

    return NextResponse.json<IApiResult<typeof post>>(
      {
        success: true,
        code: API_CODE.SUCCESS.POST_CREATED,
        data: post,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Create Post Error:', error);
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
