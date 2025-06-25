
'use server';

import { createClient, type Client, type ResultSet } from '@libsql/client';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at?: string;
}

let db: Client | null = null;

/**
 * Returns a singleton database client instance.
 */
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
    
    // In a real app, you should also handle the case where authToken is missing.
    // For this context, we assume it's provided if the URL is.
    db = createClient({ url, authToken });
    return db;
}

/**
 * Creates a new user in the database.
 * This function is intentionally simple. It executes the SQL and lets
 * the caller handle any errors (like unique constraint violations).
 * @param email The user's email address.
 * @param passwordHash The user's hashed password.
 * @returns The result set from the database operation.
 */
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

/**
 * Finds a user by their email address.
 * @param email The email address to search for.
 * @returns The user object if found, otherwise null.
 */
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
  // We need to be careful with type assertions, but for this context,
  // we are confident in the table schema.
  const user: User = {
      id: row.id as number,
      email: row.email as string,
      password_hash: row.password_hash as string,
      created_at: row.created_at as string,
  };
  return user;
}
