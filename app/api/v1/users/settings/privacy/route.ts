import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';
import { API_CODE } from '@/constants/api-code';
import { IUpdatePrivacyRequest } from '@/types_api/user/settings';

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
        isProtected: true,
        allowTagging: true,
        allowDM: true,
      },
    });

    if (!config) {
      config = {
        isProtected: false,
        allowTagging: true,
        allowDM: true,
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
    console.error('Fetch Privacy Settings Error:', error);
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

    const body = (await request.json()) as IUpdatePrivacyRequest;
    const { isProtected, allowTagging, allowDM } = body;

    const updatedConfig = await prisma.userConfig.upsert({
      where: { userId: session.id },
      update: {
        ...(isProtected !== undefined && { isProtected }),
        ...(allowTagging !== undefined && { allowTagging }),
        ...(allowDM !== undefined && { allowDM }),
      },
      create: {
        userId: session.id,
        isProtected: isProtected ?? false,
        allowTagging: allowTagging ?? true,
        allowDM: allowDM ?? true,
      },
      select: {
        isProtected: true,
        allowTagging: true,
        allowDM: true,
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
    console.error('Update Privacy Settings Error:', error);
    return NextResponse.json(
      { success: false, code: API_CODE.ERROR.SERVER_ERROR },
      { status: 500 },
    );
  }
}
