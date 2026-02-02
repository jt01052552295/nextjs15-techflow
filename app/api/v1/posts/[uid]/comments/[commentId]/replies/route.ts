/**
 * GET /api/v1/posts/:uid/comments/:commentId/replies
 * 대댓글 목록 조회
 */

import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import { API_CODE } from '@/constants/api-code';
import prisma from '@/lib/prisma';
import * as CommentService from '@/services_api/blog/comment.service';

interface IApiResult<T = any> {
  success: boolean;
  code: string;
  message?: string;
  data?: T;
}

interface RouteParams {
  params: Promise<{ commentId: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
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
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor') || undefined;
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // 부모 댓글 조회 (idx 확인)
    // commentId가 숫자면 idx, UUID면 uid로 조회
    let parentIdx: number;

    if (/^\d+$/.test(commentId)) {
      // 숫자인 경우 idx로 사용
      parentIdx = parseInt(commentId, 10);

      // 존재 확인
      const exists = await prisma.blogPostComment.findUnique({
        where: { idx: parentIdx, isUse: true },
        select: { idx: true },
      });

      if (!exists) {
        return NextResponse.json<IApiResult<null>>(
          {
            success: false,
            code: API_CODE.ERROR.COMMENT_NOT_FOUND,
            message: '댓글을 찾을 수 없습니다.',
          },
          { status: 404 },
        );
      }
    } else {
      // UUID인 경우 uid로 조회
      const parentComment = await prisma.blogPostComment.findUnique({
        where: { uid: commentId, isUse: true },
        select: { idx: true },
      });

      if (!parentComment) {
        return NextResponse.json<IApiResult<null>>(
          {
            success: false,
            code: API_CODE.ERROR.COMMENT_NOT_FOUND,
            message: '댓글을 찾을 수 없습니다.',
          },
          { status: 404 },
        );
      }

      parentIdx = parentComment.idx;
    }

    const result = await CommentService.getReplies(parentIdx, {
      cursor,
      limit,
      userId: session.id,
    });

    return NextResponse.json<IApiResult<typeof result>>(
      {
        success: true,
        code: API_CODE.SUCCESS.REPLIES_FETCHED,
        data: result,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Get Replies Error:', error);
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
