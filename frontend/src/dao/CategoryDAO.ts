import { API_BASE } from '../lib/config';
import type { Category } from './QuestDAO';

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}
