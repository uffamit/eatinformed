
'use server';

import { createClient, type Client, type ResultSet } from '@libsql/client';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at?: string;
}

let db: Client;

function getDbClient(): Client {
  if (!db) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url) {
      console.error('FATAL: TURSO_DATABASE_URL is not defined. Please set it in your .env file.');
      throw new Error('Server is not configured for database access.');
    }
    
    if (!authToken) {
       console.warn('WARNING: TURSO_AUTH_TOKEN is not defined. Connecting to the database without authentication.');
    }

    db = createClient({
      url,
      authToken,
    });
  }
  return db;
}

// Function to initialize the users table
export async function initializeTable() {
  const client = getDbClient();
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table checked/initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize users table:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

// Initialize the table when the module loads
initializeTable().catch(err => {
    console.error("Database initialization failed on startup:", err);
});


export async function createUser(email: string, passwordHash: string): Promise<ResultSet> {
  const client = getDbClient();
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
  const client = getDbClient();
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
