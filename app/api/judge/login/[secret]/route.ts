import { NextRequest, NextResponse } from 'next/server';
import * as JudgeService from '@/lib/judge-service';
import { cookies } from 'next/headers';

interface LoginParams {
  params: {
    secret: string;
  };
}

export async function GET(request: NextRequest, { params }: LoginParams) {
  try {
    const { secret } = params;
    const judge = await JudgeService.getJudgeBySecret(secret);
    
    if (!judge) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Set cookie with judge ID
    const cookieStore = await cookies();
    cookieStore.set('judge_id', String(judge.id), {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: 'strict'
    });
    
    return NextResponse.redirect(new URL('/judge', request.url));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
} 