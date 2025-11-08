import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Tooltip,
  MenuItem,
  Chip,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import type { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { Helmet } from 'react-helmet-async';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

import {
  getQuests,
  Category,
  createQuest,
  createCompletion,
  getUserCompletions,
  type Quest,
  type Completion,
} from '../dao/QuestDAO';
import { getCategories } from '../dao/CategoryDAO';

import { formatRelativeTimeWithTooltip } from '../utils/date';
import { useAuth } from '../context/AuthContext';

export default function QuestDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completingQuestId, setCompletingQuestId] = useState<number | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [snack, setSnack] = useState<{
    open: boolean;
    msg: string;
    severity: 'success' | 'error';
  }>({ open: false, msg: '', severity: 'success' });

  // Load quests and completions
  useEffect(() => {
    (async () => {
      try {
        const [questsData, completionsData] = await Promise.all([
          getQuests(),
          getUserCompletions(),
        ]);
        setQuests(questsData);
        setCompletions(completionsData);
      } catch (e: any) {
        setError(e.message || 'Failed to load quests');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Load categories
  useEffect(() => {
    (async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (e: any) {
        console.error('Failed to fetch categories:', e);
      }
    })();
  }, []);

  const handleCreate = async () => {
    try {
      const q = await createQuest({ title, description, categoryId: categoryId! });
      setQuests((prev) => [...prev, q]);
      setCreateOpen(false);
      setTitle('');
      setDescription('');
      setCategoryId(null);
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
    if (!user) {
      setSnack({
        open: true,
        msg: 'You must be logged in to complete quests',
        severity: 'error',
      });
      return;
    }

    try {
      setCompletingQuestId(questId);
      const completion = await createCompletion(questId);
      setCompletions((prev) => [...prev, completion]);
      setSnack({
        open: true,
        msg: 'Quest completion requested - pending approval',
        severity: 'success',
      });
    } catch (e: any) {
      setSnack({
        open: true,
        msg: e.message || 'Failed to request completion',
        severity: 'error',
      });
    } finally {
      setCompletingQuestId(null);
    }
  };

  const getCompletionStatus = (questId: number): Completion | undefined => {
    return completions.find((c) => c.quest_id === questId);
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'approved':
        return <Chip label="Completed" color="success" size="small" />;
      case 'pending':
        return <Chip label="Pending" color="warning" size="small" />;
      case 'rejected':
        return <Chip label="Rejected" color="error" size="small" />;
      default:
        return null;
    }
  };

  const rows: GridRowsProp = quests.map((q) => ({
    id: q.id,
    title: q.title,
    description: q.description,
    oints: q.description,
    category_name: q.category?.name ?? '—',
    score: q.category?.score ?? 0,
    created_at: q.created_at,
    updated_at: q.updated_at,
    completion: getCompletionStatus(q.id),
  }));

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'title', headerName: 'Title', minWidth: 80, flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1 },
    { field: 'category_name', headerName: 'Category', flex: 1 },
    { field: 'score', headerName: 'Points', flex: 1 },
    {
      field: 'created_at',
      headerName: 'Created',
      width: 100,
      renderCell: (params) => {
        const { display, full } = formatRelativeTimeWithTooltip(params.value);
        return (
          <Tooltip title={full}>
            <span>{display}</span>
          </Tooltip>
        );
      },
    },
    {
      field: 'updated_at',
      headerName: 'Updated',
      width: 100,
      renderCell: (params) => {
        const { display, full } = formatRelativeTimeWithTooltip(params.value);
        return (
          <Tooltip title={full}>
            <span>{display}</span>
          </Tooltip>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 300,
      renderCell: (params) => {
        const completion = params.row.completion;
        const isCompleting = completingQuestId === params.row.id;
        const isTeacher = user?.role === 'teacher';

        return (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {/* Student actions */}
            {completion ? (
              getStatusChip(completion.status)
            ) : (
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleComplete(params.row.id)}
                disabled={isCompleting}
              >
                {isCompleting ? <CircularProgress size={20} /> : 'Request Completion'}
              </Button>
            )}

            {/* Teacher actions */}
            {isTeacher && (
              <>
                <Tooltip title="View Pending Approvals">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => navigate(`/quests/${params.row.id}/pending`)}
                  >
                    <PendingActionsIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Bulk Assign Completions">
                  <IconButton
                    size="small"
                    color="secondary"
                    onClick={() => navigate(`/quests/${params.row.id}/bulk-assign`)}
                  >
                    <GroupAddIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        );
      },
    },
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard | Campus Quest</title>
      </Helmet>

      {loading ? (
        <Typography sx={{ mt: 4 }}>Loading quests…</Typography>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      ) : (
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <Box
            sx={{
              mb: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h4">Quests</Typography>
            <Button variant="contained" onClick={() => setCreateOpen(true)}>
              + New Quest
            </Button>
          </Box>

          {/* DataGrid */}
          <Paper sx={{ flexGrow: 1, width: '100%' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSizeOptions={[5, 10]}
              slots={{ toolbar: GridToolbar }}
              disableRowSelectionOnClick
              sx={{ border: 0 }}
            />
          </Paper>
        </Box>
      )}

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
            select
            label="Category"
            value={categoryId ?? ''}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            fullWidth
            margin="normal"
          >
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </TextField>
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
    </>
  );
}
