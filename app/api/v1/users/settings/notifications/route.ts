import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';
import { API_CODE } from '@/constants/api-code';
import { IUpdateNotificationRequest } from '@/types_api/user/settings';

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.UNAUTHORIZED },
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

    return NextResponse.json(
      {
        success: true,
        data: config,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Fetch Notification Settings Error:', error);
    return NextResponse.json(
      { success: false, code: API_CODE.ERROR.SERVER_ERROR },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.UNAUTHORIZED },
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
        ...(notiPushAll !== undefined && { notiPushAll }),
        ...(notiPushMention !== undefined && { notiPushMention }),
        ...(notiPushReply !== undefined && { notiPushReply }),
        ...(notiPushLike !== undefined && { notiPushLike }),
        ...(notiPushRetweet !== undefined && { notiPushRetweet }),
        ...(notiPushFollow !== undefined && { notiPushFollow }),
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

    return NextResponse.json(
      {
        success: true,
        code: API_CODE.SUCCESS.UPDATE_SETTINGS,
        data: updatedConfig,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Update Notification Settings Error:', error);
    return NextResponse.json(
      { success: false, code: API_CODE.ERROR.SERVER_ERROR },
      { status: 500 },
    );
  }
}
