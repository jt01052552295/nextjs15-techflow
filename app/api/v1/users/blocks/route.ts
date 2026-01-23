import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import prisma from '@/lib/prisma';
import { API_CODE } from '@/constants/api-code';

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.UNAUTHORIZED },
        { status: 401 },
      );
    }

    // Get user's idx
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { idx: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.USER_NOT_FOUND },
        { status: 404 },
      );
    }

    const blocks = await prisma.userBlock.findMany({
      where: { blockerIdx: user.idx },
      include: {
        blocked: {
          select: {
            id: true,
            username: true,
            nick: true,
            profile: {
              select: { url: true }, // Assuming profile has url
            },
          },
        },
      },
      orderBy: { blockDate: 'desc' },
    });

    const formattedList = blocks.map((block) => ({
      userId: block.blocked.id,
      username: block.blocked.username,
      nickname: block.blocked.nick,
      profileImage: block.blocked.profile?.[0]?.url || null, // Handle array if profile is one-to-many? Schema check needed.
    }));

    // Schema says profile UserProfile[], so it is array.

    return NextResponse.json(
      {
        success: true,
        code: API_CODE.SUCCESS.FETCH_BLOCKS,
        list: formattedList,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Fetch Blocks Error:', error);
    return NextResponse.json(
      { success: false, code: API_CODE.ERROR.SERVER_ERROR },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.UNAUTHORIZED },
        { status: 401 },
      );
    }

    const { targetUserId } = await request.json();
    if (!targetUserId) {
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.MISSING_FIELDS },
        { status: 400 },
      );
    }

    // Get user's idx
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { idx: true },
    });
    if (!user)
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.USER_NOT_FOUND },
        { status: 404 },
      );

    // Get target's idx
    const target = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { idx: true },
    });
    if (!target)
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.USER_NOT_FOUND },
        { status: 404 },
      );

    if (user.idx === target.idx) {
      // Cannot block self
      return NextResponse.json(
        { success: false, message: 'Cannot block yourself' },
        { status: 400 },
      );
    }

    // Upsert or Create (ignore if exists)
    // defined constraint: @@unique([blockerIdx, blockedIdx])

    // We can use create and catch error, or findFirst then create.
    const existing = await prisma.userBlock.findUnique({
      where: {
        blockerIdx_blockedIdx: {
          blockerIdx: user.idx,
          blockedIdx: target.idx,
        },
      },
    });

    if (!existing) {
      await prisma.userBlock.create({
        data: {
          blockerIdx: user.idx,
          blockedIdx: target.idx,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        code: API_CODE.SUCCESS.BLOCK_USER,
        message: '차단되었습니다.',
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Block User Error:', error);
    return NextResponse.json(
      { success: false, code: API_CODE.ERROR.SERVER_ERROR },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.UNAUTHORIZED },
        { status: 401 },
      );
    }

    const { targetUserId } = await request.json();
    if (!targetUserId) {
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.MISSING_FIELDS },
        { status: 400 },
      );
    }

    // Get user's idx
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { idx: true },
    });
    if (!user)
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.USER_NOT_FOUND },
        { status: 404 },
      );

    // Get target's idx
    const target = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { idx: true },
    });
    if (!target)
      return NextResponse.json(
        { success: false, code: API_CODE.ERROR.USER_NOT_FOUND },
        { status: 404 },
      );

    await prisma.userBlock.delete({
      where: {
        blockerIdx_blockedIdx: {
          blockerIdx: user.idx,
          blockedIdx: target.idx,
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        code: API_CODE.SUCCESS.UNBLOCK_USER,
        message: '차단이 해제되었습니다.',
      },
      { status: 200 },
    );
  } catch (error) {
    if ((error as any).code === 'P2025') {
      // Record not found
      return NextResponse.json(
        {
          success: true,
          code: API_CODE.SUCCESS.UNBLOCK_USER,
          message: '이미 차단 해제된 상태입니다.',
        },
        { status: 200 },
      );
    }
    console.error('Unblock User Error:', error);
    return NextResponse.json(
      { success: false, code: API_CODE.ERROR.SERVER_ERROR },
      { status: 500 },
    );
  }
}
