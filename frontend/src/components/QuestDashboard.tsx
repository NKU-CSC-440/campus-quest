import { useEffect, useState } from 'react';
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
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import type { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { Helmet } from 'react-helmet-async';

import { getQuests, createQuest, createCompletion, type Quest } from '../dao/QuestDAO';

import { formatRelativeTimeWithTooltip } from '../utils/date';

type Props = {
  currentUserId: number;
};

export default function QuestDashboard({ currentUserId }: Props) {
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
  }>({ open: false, msg: '', severity: 'success' });

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
    } catch (e: any) {
      setSnack({
        open: true,
        msg: e.message || 'Failed to mark completion',
        severity: 'error',
      });
    }
  };

  const rows: GridRowsProp = quests.map((q) => ({
    id: q.id,
    title: q.title,
    description: q.description,
    created_at: q.created_at,
    updated_at: q.updated_at,
  }));

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'title', headerName: 'Title', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 2 },
    {
      field: 'created_at',
      headerName: 'Created',
      width: 180,
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
      width: 180,
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
      width: 200,
      renderCell: (params) => (
        <Button size="small" variant="outlined" onClick={() => handleComplete(params.row.id)}>
          Complete
        </Button>
      ),
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
