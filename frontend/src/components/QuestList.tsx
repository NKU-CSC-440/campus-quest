import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Stack,
} from '@mui/material';
import { getQuests, createQuest, createCompletion, type Quest } from '../dao/QuestDAO';
import { Helmet } from 'react-helmet-async';

type Props = {
  currentUserId: number; // prototype: pass the logged-in user ID
};

export default function QuestList({ currentUserId }: Props) {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [snack, setSnack] = useState<{
    open: boolean;
    msg: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    msg: '',
    severity: 'success',
  });

  useEffect(() => {
    (async () => {
      try {
        const data = await getQuests();
        setQuests(data);
      } catch (e: any) {
        setError(e.message || 'Failed to load quests');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCreate = async () => {
    try {
      const q = await createQuest({ title, description });
      setQuests((prev) => [...prev, q]);
      setCreateOpen(false);
      setTitle('');
      setDescription('');
      setSnack({ open: true, msg: 'Quest created', severity: 'success' });
    } catch (e: any) {
      setSnack({
        open: true,
        msg: e.message || 'Failed to create quest',
        severity: 'error',
      });
    }
  };

  const handleComplete = async (questId: number) => {
    try {
      await createCompletion({
        user_id: currentUserId,
        quest_id: questId,
        completed_at: new Date().toISOString(),
      });
      setSnack({
        open: true,
        msg: 'Quest marked as completed',
        severity: 'success',
      });
      // Optional: refetch quests or optimistic UI update if you show completion state
    } catch (e: any) {
      setSnack({
        open: true,
        msg: e.message || 'Failed to mark completion',
        severity: 'error',
      });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Typography variant="h6" sx={{ mt: 4 }}>
          Loading quests…
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Helmet>
        <title>Quest List | Campus Quest</title>
        <meta name="description" content="View and manage all your Campus Quest quests." />
      </Helmet>

      <Box sx={{ my: 4 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h4">Quests</Typography>
          <Button variant="contained" onClick={() => setCreateOpen(true)}>
            New quest
          </Button>
        </Stack>

        <Paper variant="outlined">
          <List>
            {quests.map((q, idx) => (
              <Box key={q.id}>
                <ListItem>
                  <ListItemText
                    primary={q.title}
                    secondary={
                      <>
                        {q.description}
                        <br />
                        <Typography component="span" variant="caption" color="text.secondary">
                          Created: {new Date(q.created_at).toLocaleString()} • Updated:{' '}
                          {new Date(q.updated_at).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {idx < quests.length - 1 && <Divider />}
              </Box>
            ))}
            {quests.length === 0 && (
              <ListItem>
                <ListItemText primary="No quests yet. Create your first one!" />
              </ListItem>
            )}
          </List>
        </Paper>
      </Box>

      {/* Create dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create a quest</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            minRows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!title.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} onClose={() => setSnack((s) => ({ ...s, open: false }))}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Container>
  );
}
