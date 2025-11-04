import { API_BASE } from '../lib/config';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'An error occurred');
  }
  // Return undefined for 204 No Content responses
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json();
}

export interface Organization {
  id: number;
  name: string;
  description: string;
  admins?: User[];
  members?: User[];
  role?: string;
  membership_id?: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface OrganizationMembership {
  id: number;
  user: User;
  organization: Organization;
  role: string;
  status: string;
}

export class OrganizationService {
  static async getAll(): Promise<Organization[]> {
    const response = await fetch(`${API_BASE}/organizations`);
    return handleResponse(response);
  }

  static async getMyOrganizations(): Promise<Organization[]> {
    const response = await fetch(`${API_BASE}/my_organizations`, {
      credentials: 'include',
    });
    if (response.status === 401) {
      // Return empty array if not authenticated
      return [];
    }
    return handleResponse(response);
  }

  static async getMyPendingApplications(): Promise<Organization[]> {
    const response = await fetch(`${API_BASE}/my_pending_applications`, {
      credentials: 'include',
    });
    if (response.status === 401) {
      // Return empty array if not authenticated
      return [];
    }
    return handleResponse(response);
  }

  static async getMyRejectedApplications(): Promise<Organization[]> {
    const response = await fetch(`${API_BASE}/my_rejected_applications`, {
      credentials: 'include',
    });
    if (response.status === 401) {
      // Return empty array if not authenticated
      return [];
    }
    return handleResponse(response);
  }

  static async getPendingApplications(orgId: number): Promise<OrganizationMembership[]> {
    const response = await fetch(`${API_BASE}/organizations/${orgId}/pending_applications`, {
      credentials: 'include',
    });
    return handleResponse(response);
  }

  static async create(name: string, description: string): Promise<Organization> {
    const response = await fetch(`${API_BASE}/organizations`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ organization: { name, description } }),
    });
    return handleResponse(response);
  }

  static async apply(orgId: number): Promise<OrganizationMembership> {
    const response = await fetch(`${API_BASE}/organizations/${orgId}/organization_memberships`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  }

  static async updateMembership(
    membershipId: number,
    status: string
  ): Promise<OrganizationMembership> {
    const response = await fetch(`${API_BASE}/organization_memberships/${membershipId}`, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ organization_membership: { status } }),
    });
    return handleResponse(response);
  }

  static async leave(membershipId: number): Promise<void> {
    const response = await fetch(`${API_BASE}/organization_memberships/${membershipId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'An error occurred');
    }
    // Don't try to parse the response for DELETE operations
    return;
  }

  static async getMembershipForOrganization(orgId: number): Promise<OrganizationMembership | null> {
    const response = await fetch(`${API_BASE}/organizations/${orgId}/my_membership`, {
      credentials: 'include',
    });
    if (response.status === 404) {
      return null;
    }
    return handleResponse(response);
  }
}
