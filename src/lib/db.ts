
import { createClient, type Client } from '@libsql/client';

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  console.warn(
    "Turso environment variables not set. Authentication will not work. Please set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in your .env file."
  );
}

const db = createClient({
  url: process.env.TURSO_DATABASE_URL ?? "",
  authToken: process.env.TURSO_AUTH_TOKEN ?? "",
});

async function initializeTable() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at?: string;
}

export async function createUser(email: string, passwordHash: string): Promise<{ lastInsertRowid: bigint | undefined }> {
  await initializeTable();
  try {
    const result = await db.execute({
      sql: 'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      args: [email, passwordHash]
    });
    return { lastInsertRowid: result.lastInsertRowid };
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new Error('Email already exists.');
    }
    throw error;
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  await initializeTable();
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE email = ? COLLATE NOCASE',
    args: [email],
  });

  if (result.rows.length === 0) {
    return null;
  }
  
  const row = result.rows[0];
  
  // Ensure the returned object matches the User interface
  const user: User = {
      id: row.id as number,
      email: row.email as string,
      password_hash: row.password_hash as string,
      created_at: row.created_at as string | undefined,
  };
  
  return user;
}
