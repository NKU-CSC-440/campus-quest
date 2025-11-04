import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import QuestDashboard from '../QuestDashboard';
import QuestPendingCompletions from '../QuestPendingCompletions';
import BulkAssignCompletions from '../BulkAssignCompletions';
import * as QuestDAO from '../../dao/QuestDAO';
import { CompletionService } from '../../dao/CompletionService';

// Test wrapper with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>
    <BrowserRouter>{children}</BrowserRouter>
  </HelmetProvider>
);

// Mock the API services
jest.mock('../../dao/QuestDAO');
jest.mock('../../dao/CompletionService', () => ({
  CompletionService: {
    approveCompletion: jest.fn(),
    rejectCompletion: jest.fn(),
    batchCreateCompletions: jest.fn(),
    getPendingCompletions: jest.fn(),
  },
}));

// Mock useAuth hook
jest.mock('../../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const mockQuests = [
  {
    id: 1,
    title: 'Campus Tour Quest',
    description: 'Complete a full tour of campus',
    category_id: 1,
    category: {
      id: 1,
      name: 'Exploration',
      score: 100,
      created_at: '2025-01-01',
      updated_at: '2025-01-01',
    },
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
  },
  {
    id: 2,
    title: 'Study Group Challenge',
    description: 'Form a study group',
    category_id: 2,
    category: {
      id: 2,
      name: 'Social',
      score: 150,
      created_at: '2025-01-01',
      updated_at: '2025-01-01',
    },
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
  },
];

const mockCompletions = [
  {
    id: 1,
    quest_id: 1,
    user_id: 1,
    status: 'approved' as const,
    completed_at: '2025-11-01T10:00:00Z',
    created_at: '2025-11-01',
    updated_at: '2025-11-01',
  },
  {
    id: 2,
    quest_id: 2,
    user_id: 1,
    status: 'pending' as const,
    completed_at: null,
    created_at: '2025-11-02',
    updated_at: '2025-11-02',
  },
];

const mockPendingCompletions = [
  {
    id: 3,
    quest_id: 1,
    user_id: 3,
    status: 'pending' as const,
    completed_at: null,
    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    user: {
      id: 3,
      name: 'Alice Student',
      email: 'alice@nku.edu',
      role: 'student' as const,
      created_at: '2025-01-01',
      updated_at: '2025-01-01',
    },
  },
  {
    id: 4,
    quest_id: 1,
    user_id: 4,
    status: 'pending' as const,
    completed_at: null,
    created_at: '2025-11-02',
    updated_at: '2025-11-02',
    user: {
      id: 4,
      name: 'Bob Student',
      email: 'bob@nku.edu',
      role: 'student' as const,
      created_at: '2025-01-01',
      updated_at: '2025-01-01',
    },
  },
];

const mockUsers = [
  {
    id: 5,
    name: 'Charlie Student',
    email: 'charlie@nku.edu',
    role: 'student' as const,
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
  },
  {
    id: 6,
    name: 'Diana Student',
    email: 'diana@nku.edu',
    role: 'student' as const,
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
  },
  {
    id: 7,
    name: 'Eve Student',
    email: 'eve@nku.edu',
    role: 'student' as const,
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
  },
];

describe('Completion Workflow - Student', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useAuth } = require('../../context/AuthContext');
    useAuth.mockReturnValue({
      user: { id: 1, name: 'Test Student', email: 'student@nku.edu', role: 'student' },
      isAuthenticated: true,
    });
  });

  it('should show "Request Completion" button for incomplete quests', async () => {
    jest.mocked(QuestDAO.getQuests).mockResolvedValue(mockQuests);
    jest.mocked(QuestDAO.getUserCompletions).mockResolvedValue([mockCompletions[0]]);

    render(
      <BrowserRouter>
        <QuestDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Campus Tour Quest')).toBeTruthy();
    });

    // Quest 1 is approved - should show "Completed" or be disabled
    const completedButtons = screen.queryAllByText(/completed/i);
    expect(completedButtons.length).toBeGreaterThan(0);

    // Quest 2 is not completed - should show "Request Completion"
    expect(screen.getByText('Request Completion')).toBeTruthy();
  });

  it('should create pending completion when student requests', async () => {
    jest.mocked(QuestDAO.getQuests).mockResolvedValue(mockQuests);
    jest.mocked(QuestDAO.getUserCompletions).mockResolvedValue([]);
    jest.mocked(QuestDAO.createCompletion).mockResolvedValue({
      id: 5,
      quest_id: 1,
      user_id: 1,
      status: 'pending' as const,
      completed_at: null,
      created_at: '2025-11-03',
      updated_at: '2025-11-03',
    });

    render(
      <BrowserRouter>
        <QuestDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Campus Tour Quest')).toBeTruthy();
    });

    const requestButton = screen.getAllByText('Request Completion')[0];
    fireEvent.click(requestButton);

    await waitFor(() => {
      expect(QuestDAO.createCompletion).toHaveBeenCalledWith(1);
    });

    // Should show pending status after request
    await waitFor(() => {
      expect(screen.getByText(/pending/i)).toBeTruthy();
    });
  });

  it('should show status badges for user completions', async () => {
    jest.mocked(QuestDAO.getQuests).mockResolvedValue(mockQuests);
    jest.mocked(QuestDAO.getUserCompletions).mockResolvedValue(mockCompletions);

    render(
      <BrowserRouter>
        <QuestDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Campus Tour Quest')).toBeTruthy();
    });

    // Should show approved badge
    expect(screen.getByText(/approved/i)).toBeTruthy();

    // Should show pending badge
    expect(screen.getByText(/pending/i)).toBeTruthy();
  });

  it('should disable request button when completion is pending or approved', async () => {
    jest.mocked(QuestDAO.getQuests).mockResolvedValue(mockQuests);
    jest.mocked(QuestDAO.getUserCompletions).mockResolvedValue(mockCompletions);

    render(
      <BrowserRouter>
        <QuestDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Campus Tour Quest')).toBeTruthy();
    });

    // Both quests have completions (approved and pending), so no active request buttons
    const requestButtons = screen.queryAllByText('Request Completion');
    expect(requestButtons.length).toBe(0);
  });
});

describe('Completion Workflow - Teacher Approvals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useAuth } = require('../../context/AuthContext');
    useAuth.mockReturnValue({
      user: { id: 2, name: 'Test Teacher', email: 'teacher@nku.edu', role: 'teacher' },
      isAuthenticated: true,
    });
  });

  it('should display pending completions for quest creator', async () => {
    jest.mocked(CompletionService.getPendingCompletions).mockResolvedValue(mockPendingCompletions);

    render(
      <BrowserRouter>
        <QuestPendingCompletions questId={1} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Alice Student')).toBeTruthy();
      expect(screen.getByText('Bob Student')).toBeTruthy();
    });

    // Should show approve/reject buttons
    const approveButtons = screen.getAllByText(/approve/i);
    const rejectButtons = screen.getAllByText(/reject/i);

    expect(approveButtons.length).toBe(2);
    expect(rejectButtons.length).toBe(2);
  });

  it('should approve pending completion', async () => {
    jest.mocked(CompletionService.getPendingCompletions).mockResolvedValue(mockPendingCompletions);
    jest.mocked(CompletionService.approveCompletion).mockResolvedValue(undefined);

    render(
      <BrowserRouter>
        <QuestPendingCompletions questId={1} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Alice Student')).toBeTruthy();
    });

    const approveButtons = screen.getAllByText(/approve/i);
    fireEvent.click(approveButtons[0]);

    await waitFor(() => {
      expect(CompletionService.approveCompletion).toHaveBeenCalledWith(3);
    });

    // Should show success message or remove from list
    await waitFor(() => {
      expect(screen.queryByText('Alice Student')).not.toBeTruthy();
    });
  });

  it('should reject pending completion', async () => {
    jest.mocked(CompletionService.getPendingCompletions).mockResolvedValue(mockPendingCompletions);
    jest.mocked(CompletionService.rejectCompletion).mockResolvedValue(undefined);

    render(
      <BrowserRouter>
        <QuestPendingCompletions questId={1} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Alice Student')).toBeTruthy();
    });

    const rejectButtons = screen.getAllByText(/reject/i);
    fireEvent.click(rejectButtons[0]);

    await waitFor(() => {
      expect(CompletionService.rejectCompletion).toHaveBeenCalledWith(3);
    });

    // Should remove from list after rejection
    await waitFor(() => {
      expect(screen.queryByText('Alice Student')).not.toBeTruthy();
    });
  });

  it('should show empty state when no pending completions', async () => {
    jest.mocked(CompletionService.getPendingCompletions).mockResolvedValue([]);

    render(
      <BrowserRouter>
        <QuestPendingCompletions questId={1} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no pending/i)).toBeTruthy();
    });
  });
});

describe('Completion Workflow - Bulk Assignment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { useAuth } = require('../../context/AuthContext');
    useAuth.mockReturnValue({
      user: { id: 2, name: 'Test Teacher', email: 'teacher@nku.edu', role: 'teacher' },
      isAuthenticated: true,
    });
  });

  it('should allow teacher to select multiple users', async () => {
    jest.mocked(QuestDAO.getUsers).mockResolvedValue(mockUsers);

    render(
      <BrowserRouter>
        <BulkAssignCompletions questId={1} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Charlie Student')).toBeTruthy();
    });

    // Should show user selection interface
    expect(screen.getByText('Diana Student')).toBeTruthy();
    expect(screen.getByText('Eve Student')).toBeTruthy();
  });

  it('should bulk assign completions to selected users', async () => {
    jest.mocked(QuestDAO.getUsers).mockResolvedValue(mockUsers);
    jest.mocked(CompletionService.batchCreateCompletions).mockResolvedValue({
      completions: [],
      errors: [],
      created_count: 2,
    });

    render(
      <BrowserRouter>
        <BulkAssignCompletions questId={1} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Charlie Student')).toBeTruthy();
    });

    // Select multiple users (implementation depends on component design)
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]); // Charlie
    fireEvent.click(checkboxes[1]); // Diana

    const assignButton = screen.getByText(/assign completion/i);
    fireEvent.click(assignButton);

    await waitFor(() => {
      expect(CompletionService.batchCreateCompletions).toHaveBeenCalledWith(1, [5, 6]);
    });

    // Should show success message
    await waitFor(() => {
      expect(screen.getByText(/successfully assigned/i)).toBeTruthy();
    });
  });

  it('should show errors for duplicate assignments', async () => {
    jest.mocked(QuestDAO.getUsers).mockResolvedValue(mockUsers);
    jest.mocked(CompletionService.batchCreateCompletions).mockResolvedValue({
      completions: [],
      errors: ['Diana Student already has a completion'],
      created_count: 1,
    });

    render(
      <BrowserRouter>
        <BulkAssignCompletions questId={1} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Charlie Student')).toBeTruthy();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]); // Charlie
    fireEvent.click(checkboxes[1]); // Diana (already has completion)

    const assignButton = screen.getByText(/assign completion/i);
    fireEvent.click(assignButton);

    await waitFor(() => {
      expect(CompletionService.batchCreateCompletions).toHaveBeenCalledWith(1, [5, 6]);
    });

    // Should show partial success and error
    await waitFor(() => {
      expect(screen.getByText(/Diana Student already has a completion/i)).toBeTruthy();
      expect(screen.getByText(/1.*assigned/i)).toBeTruthy();
    });
  });

  it('should disable assign button when no users selected', async () => {
    jest.mocked(QuestDAO.getUsers).mockResolvedValue(mockUsers);

    render(
      <BrowserRouter>
        <BulkAssignCompletions questId={1} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Charlie Student')).toBeTruthy();
    });

    const assignButton = screen.getByText(/assign completion/i);
    expect(assignButton.hasAttribute('disabled')).toBe(true);
  });
});

describe('Completion Workflow - Authorization', () => {
  it('should not show teacher features to students', async () => {
    const { useAuth } = require('../../context/AuthContext');
    useAuth.mockReturnValue({
      user: { id: 1, name: 'Test Student', email: 'student@nku.edu', role: 'student' },
      isAuthenticated: true,
    });

    jest.mocked(QuestDAO.getQuests).mockResolvedValue(mockQuests);
    jest.mocked(QuestDAO.getUserCompletions).mockResolvedValue([]);

    render(
      <BrowserRouter>
        <QuestDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Campus Tour Quest')).toBeTruthy();
    });

    // Should not show "Pending Approvals" or "Bulk Assign" options
    expect(screen.queryByText(/pending approval/i)).not.toBeTruthy();
    expect(screen.queryByText(/bulk assign/i)).not.toBeTruthy();
  });

  it('should only allow quest creator to approve completions', async () => {
    const { useAuth } = require('../../context/AuthContext');
    useAuth.mockReturnValue({
      user: { id: 3, name: 'Other Teacher', email: 'other@nku.edu', role: 'teacher' },
      isAuthenticated: true,
    });

    // Mock API to return 403 for non-creator
    jest.mocked(CompletionService.getPendingCompletions).mockRejectedValue({
      response: { status: 403, data: { error: 'Only the quest creator can perform this action' } },
    });

    render(
      <BrowserRouter>
        <QuestPendingCompletions questId={1} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/not authorized/i)).toBeTruthy();
    });
  });
});

describe('Completion Workflow - Visual Feedback', () => {
  beforeEach(() => {
    const { useAuth } = require('../../context/AuthContext');
    useAuth.mockReturnValue({
      user: { id: 1, name: 'Test Student', email: 'student@nku.edu', role: 'student' },
      isAuthenticated: true,
    });
  });

  it('should show loading state while creating completion', async () => {
    jest.mocked(QuestDAO.getQuests).mockResolvedValue(mockQuests);
    jest.mocked(QuestDAO.getUserCompletions).mockResolvedValue([]);

    let resolveCompletion: any;
    jest.mocked(QuestDAO.createCompletion).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCompletion = resolve;
        })
    );

    render(
      <BrowserRouter>
        <QuestDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Campus Tour Quest')).toBeTruthy();
    });

    const requestButton = screen.getAllByText('Request Completion')[0];
    fireEvent.click(requestButton);

    // Should show loading indicator
    await waitFor(() => {
      expect(screen.getByRole('progressbar') || screen.getByText(/requesting/i)).toBeTruthy();
    });

    // Resolve the promise
    resolveCompletion({
      id: 5,
      quest_id: 1,
      user_id: 1,
      status: 'pending',
      completed_at: null,
    });

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeTruthy();
    });
  });

  it('should show appropriate chip colors for statuses', async () => {
    jest.mocked(QuestDAO.getQuests).mockResolvedValue(mockQuests);
    jest.mocked(QuestDAO.getUserCompletions).mockResolvedValue([
      { ...mockCompletions[0], status: 'approved' },
      { ...mockCompletions[1], status: 'pending' },
      {
        id: 3,
        quest_id: 1,
        user_id: 1,
        status: 'rejected' as const,
        completed_at: null,
        created_at: '2025-11-03',
        updated_at: '2025-11-03',
      },
    ]);

    render(
      <BrowserRouter>
        <QuestDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Campus Tour Quest')).toBeTruthy();
    });

    // Should have colored status chips
    const approvedChip = screen.getByText(/approved/i);
    const pendingChip = screen.getByText(/pending/i);
    const rejectedChip = screen.getByText(/rejected/i);

    expect(approvedChip.className).toMatch(/success/i);
    expect(pendingChip.className).toMatch(/warning/i);
    expect(rejectedChip.className).toMatch(/error/i);
  });
});
