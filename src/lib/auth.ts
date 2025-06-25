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
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return { error: 'Email already in use.', status: 409 };
    }

    if (password.length < 6) {
      return { error: 'Password must be at least 6 characters long.', status: 400 };
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const createResult = await createUser(email, passwordHash);

    // Check if the insert operation was successful by looking at rowsAffected.
    if (createResult && createResult.rowsAffected > 0) {
      // Fetch the newly created user to get their ID for the JWT.
      const newUser = await findUserByEmail(email);
      if (!newUser) {
        // This is a safeguard; it should not be reached if the user was just created.
        return { error: 'Failed to retrieve new user after creation.', status: 500 };
      }
      
      const token = jwt.sign({ userId: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '1h' });
      return { token };
    } else {
      return { error: 'Failed to create user in the database.', status: 500 };
    }
  } catch (error: any) {
    console.error('SignUp error:', error);
    if (error.message.includes('initialize the database')) {
        return { error: 'Database service is currently unavailable. Please try again later.', status: 503 };
    }
    if (error.message === 'Email already exists.') {
      return { error: 'Email already in use.', status: 409 };
    }
    return { error: 'An internal server error occurred.', status: 500 };
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
    if (error.message.includes('initialize the database')) {
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
