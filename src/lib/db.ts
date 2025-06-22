// DUMMY FILE FOR DEBUGGING
// This file bypasses the real database to isolate a server crash.
// It uses a simple in-memory array to store user data for this session.

export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at?: string;
}

// Dummy user store
const users: User[] = [];
let userIdCounter = 1;

export async function createUser(email: string, passwordHash: string): Promise<{ lastInsertRowid: bigint | undefined }> {
  console.log("DUMMY DB: Creating user", email);
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    // Mimic database constraint failure
    throw new Error('Email already exists.');
  }
  const newUser: User = {
    id: userIdCounter++,
    email,
    password_hash: passwordHash,
    created_at: new Date().toISOString()
  };
  users.push(newUser);
  return { lastInsertRowid: BigInt(newUser.id) };
}

export async function findUserByEmail(email: string): Promise<User | null> {
  console.log("DUMMY DB: Finding user", email);
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  return Promise.resolve(user);
}

// Dummy function to prevent errors from other parts of the code that might call it.
// The original function ensures the database table exists.
async function initializeTable() {
    // Do nothing in the dummy implementation.
    return Promise.resolve();
}
