import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';


export async function POST(request: NextRequest) {
  try {
    // Delete the auth cookie
    const cookieStore = await cookies();
    cookieStore.delete('admin_authenticated');
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 