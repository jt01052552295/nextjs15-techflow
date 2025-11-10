// app/api/notifications/sendtest/route.ts
import { NextResponse } from 'next/server';
import { saveNotification } from '@/lib/fcm-utils';

export async function POST(req: Request) {
  const { userId, title, message, targetLink } = await req.json();

  const success = await saveNotification({
    userId,
    title,
    message,
    targetLink,
  });

  return NextResponse.json({ success });
}
