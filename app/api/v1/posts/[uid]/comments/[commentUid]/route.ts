/**
 * PATCH  /api/v1/posts/:uid/comments/:commentUid - 댓글 수정
 * DELETE /api/v1/posts/:uid/comments/:commentUid - 댓글 삭제
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
  params: Promise<{ uid: string; commentUid: string }>;
}

const MAX_COMMENT_LENGTH = 500;

export async function PATCH(request: Request, { params }: RouteParams) {
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

    const { commentUid } = await params;
    const body = await request.json();
    const { content } = body;

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

    const comment = await CommentService.updateComment(
      commentUid,
      session.id,
      content.trim(),
    );

    if (!comment) {
      return NextResponse.json<IApiResult<null>>(
        {
          success: false,
          code: API_CODE.ERROR.COMMENT_NOT_FOUND,
          message: '댓글을 찾을 수 없습니다.',
        },
        { status: 404 },
      );
    }

    return NextResponse.json<IApiResult<typeof comment>>(
      {
        success: true,
        code: API_CODE.SUCCESS.COMMENT_UPDATED,
        data: comment,
      },
      { status: 200 },
    );
  } catch (error: any) {
    if (error.message === 'NOT_OWNER') {
      return NextResponse.json<IApiResult<null>>(
        {
          success: false,
          code: API_CODE.ERROR.NOT_COMMENT_OWNER,
          message: '수정 권한이 없습니다.',
        },
        { status: 403 },
      );
    }

    console.error('Update Comment Error:', error);
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

export async function DELETE(request: Request, { params }: RouteParams) {
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

    const { commentUid } = await params;
    const deleted = await CommentService.deleteComment(commentUid, session.id);

    if (!deleted) {
      return NextResponse.json<IApiResult<null>>(
        {
          success: false,
          code: API_CODE.ERROR.COMMENT_NOT_FOUND,
          message: '댓글을 찾을 수 없습니다.',
        },
        { status: 404 },
      );
    }

    return NextResponse.json<IApiResult<null>>(
      {
        success: true,
        code: API_CODE.SUCCESS.COMMENT_DELETED,
        message: '댓글이 삭제되었습니다.',
      },
      { status: 200 },
    );
  } catch (error: any) {
    if (error.message === 'NOT_OWNER') {
      return NextResponse.json<IApiResult<null>>(
        {
          success: false,
          code: API_CODE.ERROR.NOT_COMMENT_OWNER,
          message: '삭제 권한이 없습니다.',
        },
        { status: 403 },
      );
    }

    console.error('Delete Comment Error:', error);
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
