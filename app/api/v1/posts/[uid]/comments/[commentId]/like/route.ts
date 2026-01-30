/**
 * POST /api/v1/posts/:uid/comments/:commentId/like - 댓글 좋아요 토글
 */

import { NextResponse } from 'next/server';
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
  params: Promise<{ uid: string; commentId: string }>;
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

    const { commentId } = await params;

    // commentId가 숫자(idx)인지 uid인지 판단
    const isNumeric = /^\d+$/.test(commentId);

    let result;
    if (isNumeric) {
      result = await CommentService.toggleCommentLike(
        parseInt(commentId, 10),
        session.id,
      );
    } else {
      result = await CommentService.toggleCommentLikeByUid(
        commentId,
        session.id,
      );
    }

    if (!result) {
      return NextResponse.json<IApiResult<null>>(
        {
          success: false,
          code: API_CODE.ERROR.COMMENT_NOT_FOUND,
          message: '댓글을 찾을 수 없습니다.',
        },
        { status: 404 },
      );
    }

    return NextResponse.json<IApiResult<typeof result>>(
      {
        success: true,
        code: API_CODE.SUCCESS.COMMENT_LIKE_TOGGLED,
        data: result,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Toggle Comment Like Error:', error);
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
