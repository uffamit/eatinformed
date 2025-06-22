
import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { findUserByEmail } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    
    const decoded = verifyToken(token);
    if (!decoded || typeof decoded === 'string' || !decoded.email) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await findUserByEmail(decoded.email);
    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return user data without the password hash
    return NextResponse.json({ id: user.id, email: user.email });

  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
