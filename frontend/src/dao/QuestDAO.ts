import { API_BASE } from '../lib/config';

export type Role = 'teacher' | 'student';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  score: number;
  created_at: string;
  updated_at: string;
}

export interface Quest {
  id: number;
  title: string;
  description: string;
  category_id: number;
  category: Category;
  creator_id?: number;
  created_at: string;
  updated_at: string;
}

export interface Completion {
  id: number;
  user_id: number;
  quest_id: number;
  status: 'pending' | 'approved' | 'rejected';
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  quest?: Quest;
}

// --- Quests ---
export async function getQuests(): Promise<Quest[]> {
  const res = await fetch(`${API_BASE}/quests`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch quests');
  return res.json();
}

export async function getQuest(id: number): Promise<Quest> {
  const res = await fetch(`${API_BASE}/quests/${id}`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch quest');
  return res.json();
}

export async function createQuest(data: {
  title: string;
  description: string;
  categoryId: number;
}): Promise<Quest> {
  const res = await fetch(`${API_BASE}/quests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quest: data }),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to create quest');
  return res.json();
}

// --- Completions ---
export async function createCompletion(questId: number): Promise<Completion> {
  const res = await fetch(`${API_BASE}/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completion: { quest_id: questId } }),
    credentials: 'include',
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create completion');
  }
  return res.json();
}

export async function getUserCompletions(): Promise<Completion[]> {
  const res = await fetch(`${API_BASE}/completions`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch completions');
  const completions = await res.json();
  return completions;
}

// --- Users ---
export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE}/users`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}
