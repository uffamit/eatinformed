
import { auth as adminAuth } from 'firebase-admin';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/lib/firebase-admin';

// Initialize Firebase Admin SDK
initAdmin();

// Define cookie options
const getCookieOptions = (expires: number) => ({
  name: 'session',
  value: '',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  expires,
});

export async function POST(request: NextRequest, { params }: { params: { action: string[] } }) {
  const action = params.action[0];

  if (action === 'login') {
    try {
      const { idToken } = await request.json();
      if (!idToken) {
        return NextResponse.json({ error: 'idToken is required' }, { status: 400 });
      }

      const expiresIn = 60 * 60 * 24 * 14 * 1000; // 14 days
      const decodedIdToken = await adminAuth().verifyIdToken(idToken);
      const sessionCookie = await adminAuth().createSessionCookie(idToken, { expiresIn });

      const options = getCookieOptions(Date.now() + expiresIn);
      options.value = sessionCookie;

      cookies().set(options.name, options.value, options);

      return NextResponse.json({ status: 'success' }, { status: 200 });
    } catch (error: any) {
      console.error('Session login error:', error);
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function GET(request: NextRequest, { params }: { params: { action: string[] } }) {
    const action = params.action[0];
  
    if (action === 'logout') {
      try {
        const sessionCookie = cookies().get('session')?.value;
        if (sessionCookie) {
          const decodedClaims = await adminAuth().verifySessionCookie(sessionCookie).catch(() => null);
          if (decodedClaims) {
            await adminAuth().revokeRefreshTokens(decodedClaims.sub);
          }
        }
  
        const options = getCookieOptions(0); // Expire the cookie
        cookies().set(options.name, '', options);
  
        return NextResponse.json({ status: 'success' }, { status: 200 });
      } catch (error: any) {
        console.error('Session logout error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
  
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
