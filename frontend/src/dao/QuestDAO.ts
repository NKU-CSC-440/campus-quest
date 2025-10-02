import { API_BASE } from "../lib/config";

export type Role = "teacher" | "student";

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface Quest {
  id: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Completion {
  id: number;
  user_id: number;
  quest_id: number;
  completed_at: string;
  created_at: string;
  updated_at: string;
}

// --- Quests ---
export async function getQuests(): Promise<Quest[]> {
  const res = await fetch(`${API_BASE}/quests`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch quests");
  return res.json();
}

export async function getQuest(id: number): Promise<Quest> {
  const res = await fetch(`${API_BASE}/quests/${id}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch quest");
  return res.json();
}

export async function createQuest(data: {
  title: string;
  description: string;
}): Promise<Quest> {
  const res = await fetch(`${API_BASE}/quests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quest: data }),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to create quest");
  return res.json();
}

// --- Completions ---
export async function createCompletion(data: {
  user_id: number;
  quest_id: number;
  completed_at: string;
}): Promise<Completion> {
  const res = await fetch(`${API_BASE}/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completion: data }),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to create completion");
  return res.json();
}
