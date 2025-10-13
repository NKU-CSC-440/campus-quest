import { API_BASE } from '../lib/config';
import { Role } from './QuestDAO';

export interface UserCreateParams {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: Role;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

export async function createUser(data: UserCreateParams): Promise<User> {
  const res = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: data }),
    credentials: 'include',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.errors.join('\n') || 'Failed to create user');
  }

  return res.json();
}
