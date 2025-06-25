'use server';

import { createClient, type Client, type ResultSet } from '@libsql/client';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at?: string;
}

function createDbClient(): Client {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url) {
        // This is a fatal server configuration error.
        console.error('FATAL: TURSO_DATABASE_URL is not set in .env file.');
        throw new Error('Server is not configured for database access.');
    }
    
    return createClient({ url, authToken });
}

// Singleton client instance.
// This is created once when the module is first loaded.
const db = createDbClient();

// This function provides the database client.
// It assumes the `users` table already exists in the database.
function getDb(): Client {
    return db;
}


export async function createUser(email: string, passwordHash: string): Promise<ResultSet> {
  const client = getDb();
  try {
    const result = await client.execute({
      sql: 'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      args: [email.toLowerCase(), passwordHash],
    });
    return result;
  } catch (error: any) {
    // Check for unique constraint violation
    if (error.code === 'SQLITE_CONSTRAINT' && error.message.includes('UNIQUE constraint failed: users.email')) {
       throw new Error('Email already exists.');
    }
    console.error('Failed to create user:', error);
    throw new Error('An internal server error occurred during user creation.');
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const client = getDb();
  try {
    const result = await client.execute({
      sql: 'SELECT id, email, password_hash, created_at FROM users WHERE email = ?',
      args: [email.toLowerCase()],
    });

    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    const user: User = {
        id: row.id as number,
        email: row.email as string,
        password_hash: row.password_hash as string,
        created_at: row.created_at as string,
    };
    return user;

  } catch (error) {
    console.error('Failed to find user by email:', error);
    throw new Error('An internal server error occurred while retrieving user data.');
  }
}
