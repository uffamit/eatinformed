
import { createClient, type Client, type InStatement } from '@libsql/client';

let db: Client | null = null;

const getDbClient = (): Client => {
  if (db) {
    return db;
  }

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error(
      "Turso environment variables not set. Authentication will not work. Please set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in your .env file."
    );
    throw new Error("Server database configuration is incomplete.");
  }
  
  db = createClient({
    url,
    authToken,
  });

  return db;
}


async function initializeTable() {
  const client = getDbClient();
  await client.execute(`
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
  const client = getDbClient();
  try {
    const result = await client.execute({
      sql: 'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      args: [email, passwordHash]
    });
    return { lastInsertRowid: result.lastInsertRowid };
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || (error.message && error.message.includes("UNIQUE constraint failed"))) {
      throw new Error('Email already exists.');
    }
    throw error;
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  await initializeTable();
  const client = getDbClient();
  
  const result = await client.execute({
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
