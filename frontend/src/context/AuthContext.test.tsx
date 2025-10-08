import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

const TestComponent: React.FC = () => {
  const { user, loading, error, login, logout, checkSession } = useAuth();
  return (
    <div>
      <div data-testid="user">{user ? user.email : 'null'}</div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <button onClick={() => login('test@example.com', 'password123')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
      <button onClick={() => checkSession()}>CheckSession</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides expected values', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false }); // For initial checkSession
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    await waitFor(() => expect(getByTestId('loading').textContent).toBe('not-loading'));
    expect(getByTestId('user').textContent).toBe('null');
    expect(getByTestId('error').textContent).toBe('no-error');
  });

  it('login with valid credentials sets user', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false }); // Initial checkSession
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { email: 'test@example.com' } }),
    });
    const { getByText, getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    await act(async () => {
      getByText('Login').click();
    });
    await waitFor(() => expect(getByTestId('user').textContent).toBe('test@example.com'));
    expect(getByTestId('error').textContent).toBe('no-error');
  });

  it('login with invalid credentials sets error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false }); // Initial checkSession
    mockFetch.mockResolvedValueOnce({ ok: false }); // Login
    const { getByText, getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    await act(async () => {
      getByText('Login').click();
    });
    await waitFor(() => expect(getByTestId('error').textContent).not.toBe('no-error'));
    expect(getByTestId('user').textContent).toBe('null');
  });

  it('logout clears user', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false }); // Initial checkSession
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { email: 'test@example.com' } }),
    });
    mockFetch.mockResolvedValueOnce({ ok: true }); // Logout
    const { getByText, getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    await act(async () => {
      getByText('Login').click();
    });
    await waitFor(() => expect(getByTestId('user').textContent).toBe('test@example.com'));
    await act(async () => {
      getByText('Logout').click();
    });
    await waitFor(() => expect(getByTestId('user').textContent).toBe('null'));
  });

  it('checkSession sets user when logged in', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false }); // Initial checkSession
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: { email: 'test@example.com' } }),
    });
    const { getByText, getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    await act(async () => {
      getByText('CheckSession').click();
    });
    await waitFor(() => expect(getByTestId('user').textContent).toBe('test@example.com'));
  });

  it('checkSession sets user to null when not logged in', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false }); // Initial checkSession
    mockFetch.mockResolvedValueOnce({ ok: false }); // checkSession
    const { getByText, getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    await act(async () => {
      getByText('CheckSession').click();
    });
    await waitFor(() => expect(getByTestId('user').textContent).toBe('null'));
  });
});
