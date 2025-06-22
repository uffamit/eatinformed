
'use server';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail, type User } from './db';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined. Please set it in your .env file.");
  process.exit(1);
}

const SALT_ROUNDS = 10;

interface SignUpResult {
  token?: string;
  error?: string;
  status?: number;
}

interface SignInResult {
  token?: string;
  error?: string;
  status?: number;
}

export async function signUp(email: string, password: string): Promise<SignUpResult> {
  try {
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return { error: 'Email already in use.', status: 409 };
    }

    if (password.length < 6) {
      return { error: 'Password must be at least 6 characters long.', status: 400 };
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = createUser(email, passwordHash);

    if (result && result.lastInsertRowid) {
      const userId = Number(result.lastInsertRowid);
      const token = jwt.sign({ userId, email }, JWT_SECRET!, { expiresIn: '1h' });
      return { token };
    } else {
      return { error: 'Failed to create user.', status: 500 };
    }
  } catch (error: any) {
    console.error('SignUp error:', error);
    if (error.message === 'Email already exists.') {
      return { error: 'Email already in use.', status: 409 };
    }
    return { error: 'An internal server error occurred.', status: 500 };
  }
}

export async function signIn(email: string, password: string): Promise<SignInResult> {
  try {
    const user = findUserByEmail(email);
    if (!user) {
      return { error: 'Invalid email or password.', status: 401 };
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return { error: 'Invalid email or password.', status: 401 };
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET!, { expiresIn: '1h' });
    return { token };
  } catch (error) {
    console.error('SignIn error:', error);
    return { error: 'An internal server error occurred.', status: 500 };
  }
}

export function verifyToken(token: string): jwt.JwtPayload | string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET!);
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}
