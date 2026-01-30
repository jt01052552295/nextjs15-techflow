/**
 * GET    /api/v1/posts/:uid - 게시물 상세
 * PATCH  /api/v1/posts/:uid - 게시물 수정
 * DELETE /api/v1/posts/:uid - 게시물 삭제
 */

import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import { API_CODE } from '@/constants/api-code';
import * as PostService from '@/services_api/blog/post.service';
import type { IPostUpdateRequest } from '@/types_api/posts';

interface IApiResult<T = any> {
  success: boolean;
  code: string;
  message?: string;
  data?: T;
}

const MAX_CONTENT_LENGTH = 280;

interface RouteParams {
  params: Promise<{ uid: string }>;
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

    const { uid } = await params;
    const post = await PostService.getPostByUid(uid, session.id);

    if (!post) {
      return NextResponse.json<IApiResult<null>>(
        {
          success: false,
          code: API_CODE.ERROR.POST_NOT_FOUND,
          message: '게시물을 찾을 수 없습니다.',
        },
        { status: 404 },
      );
    }

    return NextResponse.json<IApiResult<typeof post>>(
      {
        success: true,
        code: API_CODE.SUCCESS.POST_FETCHED,
        data: post,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Get Post Error:', error);
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

    const { uid } = await params;
    const body = (await request.json()) as IPostUpdateRequest;
    const { content } = body;

    // 유효성 검사
    if (content !== undefined) {
      if (content.trim().length === 0) {
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
    }

    const post = await PostService.updatePost(uid, session.id, {
      content: content?.trim(),
    });

    if (!post) {
      return NextResponse.json<IApiResult<null>>(
        {
          success: false,
          code: API_CODE.ERROR.POST_NOT_FOUND,
          message: '게시물을 찾을 수 없습니다.',
        },
        { status: 404 },
      );
    }

    return NextResponse.json<IApiResult<typeof post>>(
      {
        success: true,
        code: API_CODE.SUCCESS.POST_UPDATED,
        data: post,
      },
      { status: 200 },
    );
  } catch (error: any) {
    if (error.message === 'NOT_OWNER') {
      return NextResponse.json<IApiResult<null>>(
        {
          success: false,
          code: API_CODE.ERROR.NOT_POST_OWNER,
          message: '수정 권한이 없습니다.',
        },
        { status: 403 },
      );
    }

    console.error('Update Post Error:', error);
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

    const { uid } = await params;
    const deleted = await PostService.deletePost(uid, session.id);

    if (!deleted) {
      return NextResponse.json<IApiResult<null>>(
        {
          success: false,
          code: API_CODE.ERROR.POST_NOT_FOUND,
          message: '게시물을 찾을 수 없습니다.',
        },
        { status: 404 },
      );
    }

    return NextResponse.json<IApiResult<null>>(
      {
        success: true,
        code: API_CODE.SUCCESS.POST_DELETED,
        message: '게시물이 삭제되었습니다.',
      },
      { status: 200 },
    );
  } catch (error: any) {
    if (error.message === 'NOT_OWNER') {
      return NextResponse.json<IApiResult<null>>(
        {
          success: false,
          code: API_CODE.ERROR.NOT_POST_OWNER,
          message: '삭제 권한이 없습니다.',
        },
        { status: 403 },
      );
    }

    console.error('Delete Post Error:', error);
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
