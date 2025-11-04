const API_BASE_URL = 'http://localhost:3000/api/v1';

export interface Completion {
  id: number;
  quest_id: number;
  user_id: number;
  status: 'pending' | 'approved' | 'rejected';
  completed_at: string | null;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export interface BatchCreateResponse {
  completions: Completion[];
  errors: string[];
  created_count: number;
}

export class CompletionService {
  static async approveCompletion(completionId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/completions/${completionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'approved' }),
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(`Failed to approve completion: ${response.statusText}`);
    }
  }

  static async rejectCompletion(completionId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/completions/${completionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'rejected' }),
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(`Failed to reject completion: ${response.statusText}`);
    }
  }

  static async batchCreateCompletions(
    questId: number,
    userIds: number[]
  ): Promise<BatchCreateResponse> {
    const response = await fetch(`${API_BASE_URL}/quests/${questId}/completions/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_ids: userIds }),
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(`Failed to create batch completions: ${response.statusText}`);
    }
    return response.json();
  }

  static async getPendingCompletions(questId: number): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/quests/${questId}/completions/pending`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error(`Failed to get pending completions: ${response.statusText}`);
    }
    return response.json();
  }
}
