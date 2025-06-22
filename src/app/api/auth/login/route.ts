
import { NextResponse, type NextRequest } from 'next/server';
import { signIn } from '@/lib/auth';
 
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const result = await signIn(email, password);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status || 500 });
    }
 
    if (result.token) {
      return NextResponse.json({ token: result.token }, { status: 200 });
    }
    
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}

