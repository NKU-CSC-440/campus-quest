import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import * as QuestDAO from '../dao/QuestDAO';
import { CompletionService } from '../dao/CompletionService';

interface BulkAssignCompletionsProps {
  questId: number;
}

const BulkAssignCompletions: React.FC<BulkAssignCompletionsProps> = ({ questId }) => {
  const [users, setUsers] = useState<QuestDAO.User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [snack, setSnack] = useState<{
    open: boolean;
    msg: string;
    severity: 'success' | 'error';
  }>({ open: false, msg: '', severity: 'success' });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await QuestDAO.getUsers();
        setUsers(data.filter((u) => u.role === 'student'));
      } catch (err) {
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleToggle = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleAssign = async () => {
    try {
      setAssigning(true);
      setError(null);
      setSuccess(null);
      const result = await CompletionService.batchCreateCompletions(questId, selectedUsers);
      if (result.errors.length > 0) {
        setSnack({
          open: true,
          msg: result.errors.join(', '),
          severity: 'error',
        });
      }
      if (result.created_count > 0) {
        setSnack({
          open: true,
          msg: `Successfully assigned completions to ${result.created_count} user(s)`,
          severity: 'success',
        });
        setSelectedUsers([]);
      }
    } catch (e: any) {
      setSnack({
        open: true,
        msg: e.message || 'Failed to assign completions',
        severity: 'error',
      });
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Bulk Assign Completions
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Select students to mark as having completed this quest
        </Typography>

        <List sx={{ maxHeight: 400, overflow: 'auto', mb: 2 }}>
          {users.map((user) => (
            <ListItem key={user.id} disablePadding>
              <ListItemButton onClick={() => handleToggle(user.id)}>
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={selectedUsers.includes(user.id)}
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItemIcon>
                <ListItemText primary={user.name} secondary={user.email} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Button
          variant="contained"
          onClick={handleAssign}
          disabled={selectedUsers.length === 0 || assigning}
          fullWidth
        >
          {assigning ? 'Assigning...' : `Assign Completion to ${selectedUsers.length} User(s)`}
        </Button>
      </Paper>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default BulkAssignCompletions;
