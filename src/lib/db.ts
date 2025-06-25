
'use server';

import { createClient, type Client, type ResultSet } from '@libsql/client';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at?: string;
}

// Singleton instance for the database client
let dbInstance: Client | null = null;
// Flag to ensure initialization only runs once per server instance lifetime.
let dbInitialized = false;

// This function initializes the database.
async function initializeDatabase(client: Client): Promise<void> {
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
        dbInitialized = true; // Set flag on success
    } catch (error) {
        console.error('Failed to initialize users table:', error);
        throw error; // Re-throw the error to be handled by the caller
    }
}

function getDbClient(): Client {
  if (!dbInstance) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url) {
      console.error('FATAL: TURSO_DATABASE_URL is not defined. Please set it in your .env file.');
      throw new Error('Server is not configured for database access.');
    }
    
    if (!authToken) {
       console.warn('WARNING: TURSO_AUTH_TOKEN is not defined. Connecting to the database without authentication.');
    }

    dbInstance = createClient({
      url,
      authToken,
    });
  }
  return dbInstance;
}

// This wrapper ensures initialization only runs once.
async function getInitializedDbClient(): Promise<Client> {
    const client = getDbClient();
    if (!dbInitialized) {
      await initializeDatabase(client);
    }
    return client;
}

export async function createUser(email: string, passwordHash: string): Promise<ResultSet> {
  const client = await getInitializedDbClient();
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
  const client = await getInitializedDbClient();
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
