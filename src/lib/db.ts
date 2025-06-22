
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.resolve(process.cwd());
const DB_PATH = process.env.VERCEL ? '/tmp/database.sqlite' : path.join(DB_DIR, 'database.sqlite');

// Ensure the directory exists (though for project root, it always will)
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const db = new Database(DB_PATH);


db.pragma('journal_mode = WAL');


db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at?: string;
}

export function createUser(email: string, passwordHash: string): Database.RunResult {
  const stmt = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)');
  try {
    return stmt.run(email, passwordHash);
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new Error('Email already exists.');
    }
    throw error;
  }
}

export function findUserByEmail(email: string): User | null {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ? COLLATE NOCASE');
  const user = stmt.get(email) as User | undefined;
  return user || null;
}

export default db;
