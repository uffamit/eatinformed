'use server';

import { createClient, type Client, type ResultSet } from '@libsql/client';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at?: string;
}

let db: Client | null = null;
let initialized = false;
let initializationError: Error | null = null;

// This function provides a singleton, initialized database client.
async function getDb(): Promise<Client> {
    if (db && initialized) {
        return db;
    }
    
    // If initialization previously failed, don't retry.
    if (initializationError) {
        throw initializationError;
    }

    if (!db) {
        const url = process.env.TURSO_DATABASE_URL;
        const authToken = process.env.TURSO_AUTH_TOKEN;

        if (!url) {
            const err = new Error('Server is not configured for database access. TURSO_DATABASE_URL is missing.');
            initializationError = err;
            console.error('FATAL: TURSO_DATABASE_URL is not defined.');
            throw err;
        }
        
        if (!authToken) {
           console.warn('WARNING: TURSO_AUTH_TOKEN is not defined. Connecting to the database without authentication.');
        }

        db = createClient({ url, authToken });
    }

    try {
        // Run the initialization query.
        await db.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        initialized = true;
        console.log("Database table 'users' checked/initialized successfully.");
        return db;
    } catch (e: any) {
        initializationError = new Error("Could not initialize the database.");
        console.error("Failed to initialize users table:", e);
        throw initializationError;
    }
}


export async function createUser(email: string, passwordHash: string): Promise<ResultSet> {
  const client = await getDb();
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
  const client = await getDb();
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
