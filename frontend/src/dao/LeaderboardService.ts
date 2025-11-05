import { API_BASE } from '../lib/config';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'An error occurred');
  }
  return response.json();
}

export interface LeaderboardEntry {
  id: number;
  name: string;
  email: string;
  score: number;
}

export class LeaderboardService {
  static async getGlobalLeaderboard(): Promise<LeaderboardEntry[]> {
    const response = await fetch(`${API_BASE}/leaderboard`, {
      credentials: 'include',
    });
    return handleResponse(response);
  }

  static async getOrganizationLeaderboard(organizationId: number): Promise<LeaderboardEntry[]> {
    const response = await fetch(`${API_BASE}/organizations/${organizationId}/leaderboard`, {
      credentials: 'include',
    });
    return handleResponse(response);
  }
}
