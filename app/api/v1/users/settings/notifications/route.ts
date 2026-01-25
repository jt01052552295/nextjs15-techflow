import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';
import { API_CODE } from '@/constants/api-code';
import {
  IUpdateNotificationRequest,
  IApiResult,
} from '@/types_api/user/settings';

export async function GET() {
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

    let config = await prisma.userConfig.findUnique({
      where: { userId: session.id },
      select: {
        notiPushAll: true,
        notiPushMention: true,
        notiPushReply: true,
        notiPushLike: true,
        notiPushRetweet: true,
        notiPushFollow: true,
        notiPushDM: true,
        notiEmailAll: true,
      },
    });

    if (!config) {
      config = {
        notiPushAll: true,
        notiPushMention: true,
        notiPushReply: true,
        notiPushLike: true,
        notiPushRetweet: true,
        notiPushFollow: true,
        notiPushDM: true,
        notiEmailAll: true,
      };
    }

    return NextResponse.json<IApiResult<typeof config>>(
      {
        success: true,
        code: API_CODE.SUCCESS.FETCH_SETTINGS,
        data: config,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Fetch Notification Settings Error:', error);
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

export async function PATCH(request: Request) {
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

    const body = (await request.json()) as IUpdateNotificationRequest;

    const { notiPushAll, notiEmailAll } = body;

    let {
      notiPushMention,
      notiPushReply,
      notiPushLike,
      notiPushRetweet,
      notiPushFollow,
      notiPushDM,
    } = body;

    if (notiPushAll === false) {
      notiPushMention = false;
      notiPushReply = false;
      notiPushLike = false;
      notiPushRetweet = false;
      notiPushFollow = false;
      notiPushDM = false;
    }

    const updatedConfig = await prisma.userConfig.upsert({
      where: { userId: session.id },
      update: {
        ...(notiPushDM !== undefined && { notiPushDM }),
        ...(notiEmailAll !== undefined && { notiEmailAll }),
      },
      create: {
        userId: session.id,
        notiPushAll: notiPushAll ?? true,
        notiPushMention: notiPushMention ?? true,
        notiPushReply: notiPushReply ?? true,
        notiPushLike: notiPushLike ?? true,
        notiPushRetweet: notiPushRetweet ?? true,
        notiPushFollow: notiPushFollow ?? true,
        notiPushDM: notiPushDM ?? true,
        notiEmailAll: notiEmailAll ?? true,
      },
      select: {
        notiPushAll: true,
        notiPushMention: true,
        notiPushReply: true,
        notiPushLike: true,
        notiPushRetweet: true,
        notiPushFollow: true,
        notiPushDM: true,
        notiEmailAll: true,
      },
    });

    return NextResponse.json<IApiResult<typeof updatedConfig>>(
      {
        success: true,
        code: API_CODE.SUCCESS.UPDATE_SETTINGS,
        message: '알림 설정이 업데이트되었습니다.',
        data: updatedConfig,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Update Notification Settings Error:', error);
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
