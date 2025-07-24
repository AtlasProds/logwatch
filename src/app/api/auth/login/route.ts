import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const { password } = await request.json();

  if (password === process.env.LOGWATCH_PASSWORD) {
    const cookieStore = cookies();
    cookieStore.set('password', password, { secure: process.env.NODE_ENV === 'production', httpOnly: true });
    return NextResponse.json({ success: true });
  } else {
    return new Response('Unauthorized', { status: 401 });
  }
}
