import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany();

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Error while scraping:', error);
    NextResponse.json({ success: false, error: error.message });
  }
}
