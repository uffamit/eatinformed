
import { NextResponse, type NextRequest } from 'next/server';
import { signUp } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    // Basic email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
        return NextResponse.json({ error: 'Invalid email format.' }, { status: 400 });
    }


    const result = await signUp(email, password);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status || 500 });
    }

    if (result.token) {
      return NextResponse.json({ token: result.token }, { status: 201 });
    }

    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });

  } catch (error) {
    console.error('Signup API error:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
