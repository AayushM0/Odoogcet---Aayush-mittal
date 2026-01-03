import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { getDb } from './db';
import { User } from '@/models/User';
import { ObjectId } from 'mongodb';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createSession(userId: string, role: string) {
  const sessionData = JSON.stringify({ userId, role });
  const cookieStore = await cookies();
  cookieStore.set('session', sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function getSession(): Promise<{ userId: string; role: string } | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  
  if (!sessionCookie) {
    return null;
  }

  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  
  if (!session) {
    return null;
  }

  const db = await getDb();
  const user = await db.collection<User>('users').findOne({
    _id: new ObjectId(session.userId),
  });

  return user;
}

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuth();
  
  if (user.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }

  return user;
}
