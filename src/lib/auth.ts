
'use server';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail, type User } from './db';

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
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined. Please set it in your .env file.");
    return { error: 'Server configuration error.', status: 500 };
  }

  try {
    // It's good practice to check for existence first to provide a fast and clear error.
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return { error: 'Email already in use.', status: 409 };
    }

    if (password.length < 6) {
      return { error: 'Password must be at least 6 characters long.', status: 400 };
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    
    // The createUser function will now throw an error on its own if the email is a duplicate,
    // which we'll catch below. This handles the race condition where a user signs up
    // between the `findUserByEmail` check and this `createUser` call.
    await createUser(email, passwordHash);

    const newUser = await findUserByEmail(email);

    if (newUser) {
      const token = jwt.sign({ userId: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '1h' });
      return { token };
    } else {
      // This case should ideally not be reached if createUser is successful.
      console.error("SignUp error: User was supposedly created but could not be found immediately after.");
      return { error: 'Failed to finalize user account. Please try again.', status: 500 };
    }
  } catch (error: any) {
    console.error('SignUp error:', error);
    // Check for the specific unique constraint error from the database driver.
    if (error.code === 'SQLITE_CONSTRAINT' && error.message.includes('UNIQUE constraint failed: users.email')) {
      return { error: 'Email already in use.', status: 409 };
    }
    // Handle specific error for database configuration/connection issues
    if (error.message.includes('database access')) {
      return { error: 'Database service is currently unavailable. Please try again later.', status: 503 };
    }
    // Generic catch-all for other unexpected errors
    return { error: 'An internal server error occurred during signup.', status: 500 };
  }
}

export async function signIn(email: string, password: string): Promise<SignInResult> {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined. Please set it in your .env file.");
    return { error: 'Server configuration error.', status: 500 };
  }
  
  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return { error: 'Invalid email or password.', status: 401 };
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return { error: 'Invalid email or password.', status: 401 };
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    return { token };
  } catch (error: any) {
    console.error('SignIn error:', error);
    if (error.message.includes('database access')) {
        return { error: 'Database service is currently unavailable. Please try again later.', status: 503 };
    }
    return { error: 'An internal server error occurred.', status: 500 };
  }
}

export async function verifyToken(token: string): Promise<jwt.JwtPayload | string | null> {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined. Please set it in your .env file.");
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}
