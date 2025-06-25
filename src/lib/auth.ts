
'use server';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail, type User } from './db';

const SALT_ROUNDS = 10;
const JWT_EXPIRATION = '1h';

interface AuthResult {
  token?: string;
  error?: string;
  status?: number;
}

/**
 * Registers a new user.
 * @param email The user's email.
 * @param password The user's password (must be at least 6 characters).
 * @returns An AuthResult containing a JWT token or an error.
 */
export async function signUp(email: string, password: string): Promise<AuthResult> {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined.");
    return { error: 'Server configuration error.', status: 500 };
  }

  try {
    if (password.length < 6) {
      return { error: 'Password must be at least 6 characters long.', status: 400 };
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return { error: 'Email already in use.', status: 409 }; // 409 Conflict
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    
    // This `try...catch` specifically handles a race condition where two users
    // sign up with the same email at the same time. The first check would pass for both,
    // but the database's UNIQUE constraint will catch the second attempt.
    try {
        await createUser(email, passwordHash);
    } catch (error: any) {
        if (error.code === 'SQLITE_CONSTRAINT' && error.message.includes('UNIQUE constraint failed: users.email')) {
             return { error: 'Email already in use.', status: 409 };
        }
        // Re-throw other database errors to be caught by the outer block
        throw error;
    }

    const newUser = await findUserByEmail(email);
    if (!newUser) {
      // This should be an extremely rare case.
      console.error("SignUp error: User was supposedly created but could not be found.");
      return { error: 'Failed to finalize account creation.', status: 500 };
    }

    const token = jwt.sign({ userId: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
    return { token };

  } catch (error) {
    console.error('An unexpected error occurred during signup:', error);
    return { error: 'An internal server error occurred during signup.', status: 500 };
  }
}

/**
 * Signs in an existing user.
 * @param email The user's email.
 * @param password The user's password.
 * @returns An AuthResult containing a JWT token or an error.
 */
export async function signIn(email: string, password: string): Promise<AuthResult> {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined.");
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

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
    return { token };

  } catch (error) {
    console.error('An unexpected error occurred during signin:', error);
    return { error: 'An internal server error occurred.', status: 500 };
  }
}

/**
 * Verifies a JWT token.
 * @param token The JWT token to verify.
 * @returns The decoded token payload if valid, otherwise null.
 */
export async function verifyToken(token: string): Promise<jwt.JwtPayload | string | null> {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined.");
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    // This is expected for invalid or expired tokens
    console.log('Token verification failed:', error instanceof jwt.JsonWebTokenError ? error.message : error);
    return null;
  }
}
