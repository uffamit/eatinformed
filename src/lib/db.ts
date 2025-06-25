
'use server';

import { createClient, type Client, type ResultSet } from '@libsql/client';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at?: string;
}

let db: Client | null = null;

function getDb(): Client {
    if (db) {
        return db;
    }
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url) {
        console.error('FATAL: TURSO_DATABASE_URL is not set in .env file.');
        throw new Error('Server is not configured for database access.');
    }
    
    db = createClient({ url, authToken });
    return db;
}

export async function createUser(email: string, passwordHash: string): Promise<ResultSet> {
  const client = getDb();
  // The calling function (e.g., `signUp` in `auth.ts`) is responsible
  // for handling specific database errors.
  const result = await client.execute({
    sql: 'INSERT INTO users (email, password_hash) VALUES (?, ?)',
    args: [email.toLowerCase(), passwordHash],
  });
  return result;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const client = getDb();
  // Let errors bubble up to the caller for more specific handling.
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
}
