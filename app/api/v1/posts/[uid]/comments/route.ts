/**
 * GET  /api/v1/posts/:uid/comments - 댓글 목록
 * POST /api/v1/posts/:uid/comments - 댓글 작성
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import { API_CODE } from '@/constants/api-code';
import * as CommentService from '@/services_api/blog/comment.service';

interface IApiResult<T = any> {
  success: boolean;
  code: string;
  message?: string;
  data?: T;
}

interface RouteParams {
  params: Promise<{ uid: string }>;
}

const MAX_COMMENT_LENGTH = 500;

export async function GET(request: NextRequest, { params }: RouteParams) {
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
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await CommentService.getComments(uid, {
      cursor,
      limit,
      userId: session.id,
    });

    return NextResponse.json<IApiResult<typeof result>>(
      {
        success: true,
        code: API_CODE.SUCCESS.COMMENTS_FETCHED,
        data: result,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Get Comments Error:', error);
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
    const body = await request.json();
    const { content, parentIdx } = body;

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

    if (content.length > MAX_COMMENT_LENGTH) {
      return NextResponse.json<IApiResult<null>>(
        {
          success: false,
          code: API_CODE.ERROR.CONTENT_TOO_LONG,
          message: `댓글은 ${MAX_COMMENT_LENGTH}자를 초과할 수 없습니다.`,
        },
        { status: 400 },
      );
    }

    const comment = await CommentService.createComment(uid, session.id, {
      content: content.trim(),
      parentIdx: parentIdx ? parseInt(parentIdx, 10) : undefined,
    });

    if (!comment) {
      return NextResponse.json<IApiResult<null>>(
        {
          success: false,
          code: API_CODE.ERROR.POST_NOT_FOUND,
          message: '게시물을 찾을 수 없습니다.',
        },
        { status: 404 },
      );
    }

    return NextResponse.json<IApiResult<typeof comment>>(
      {
        success: true,
        code: API_CODE.SUCCESS.COMMENT_CREATED,
        data: comment,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Create Comment Error:', error);
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
