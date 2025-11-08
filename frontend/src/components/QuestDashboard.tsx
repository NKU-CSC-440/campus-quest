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
import type { GridColDef, GridRowsProp, GridSortModel } from '@mui/x-data-grid';
import { Helmet } from 'react-helmet-async';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import InfoIcon from '@mui/icons-material/Info';

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

  // Pagination state
  const [paginationModel, setPaginationModel] = useState({
    page: 0, // MUI DataGrid uses 0-based pages
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);

  // Sorting state
  const [sortModel, setSortModel] = useState<GridSortModel>([
    { field: 'created_at', sort: 'desc' },
  ]);

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

  // Quest info modal state
  const [infoOpen, setInfoOpen] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);

  // Load quests with pagination and sorting
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const page = paginationModel.page + 1; // Convert from 0-based to 1-based
        const sortField = sortModel[0]?.field;
        const sortOrder =
          sortModel[0]?.sort === 'asc' ? 'asc' : sortModel[0]?.sort === 'desc' ? 'desc' : undefined;

        const [questsResponse, completionsData] = await Promise.all([
          getQuests(page, paginationModel.pageSize, sortField, sortOrder),
          getUserCompletions(),
        ]);
        setQuests(questsResponse.quests);
        setRowCount(questsResponse.pagination.total_count);
        setCompletions(completionsData);
      } catch (e: any) {
        setError(e.message || 'Failed to load quests');
      } finally {
        setLoading(false);
      }
    })();
  }, [paginationModel.page, paginationModel.pageSize, sortModel]);

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
      await createQuest({ title, description, categoryId: categoryId! });
      setCreateOpen(false);
      setTitle('');
      setDescription('');
      setCategoryId(null);
      setSnack({ open: true, msg: 'Quest created', severity: 'success' });

      // Refetch quests to show the new one
      const page = paginationModel.page + 1;
      const sortField = sortModel[0]?.field;
      const sortOrder =
        sortModel[0]?.sort === 'asc' ? 'asc' : sortModel[0]?.sort === 'desc' ? 'desc' : undefined;
      const questsResponse = await getQuests(page, paginationModel.pageSize, sortField, sortOrder);
      setQuests(questsResponse.quests);
      setRowCount(questsResponse.pagination.total_count);
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

  const handleOpenInfo = (quest: Quest) => {
    setSelectedQuest(quest);
    setInfoOpen(true);
  };

  const handleCloseInfo = () => {
    setInfoOpen(false);
    setSelectedQuest(null);
  };

  const rows: GridRowsProp = quests.map((q) => ({
    id: q.id,
    quest: q,
    title: q.title,
    category_name: q.category?.name ?? '—',
    score: q.category?.score ?? 0,
    creator_id: q.creator_id,
    completion: getCompletionStatus(q.id),
  }));

  const columns: GridColDef[] = [
    {
      field: 'info',
      headerName: '',
      width: 60,
      sortable: false,
      display: 'flex',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => handleOpenInfo(params.row.quest)}
            >
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
    { field: 'title', headerName: 'Title', minWidth: 200, flex: 1 },
    { field: 'category_name', headerName: 'Category', width: 150 },
    { field: 'score', headerName: 'Points', width: 100 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 300,
      display: 'flex',
      renderCell: (params) => {
        const completion = params.row.completion;
        const isCompleting = completingQuestId === params.row.id;
        const isTeacher = user?.role === 'teacher';
        const isCreator = params.row.creator_id === user?.id;
        const canRequestCompletion = !completion && !isCreator;

        return (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', height: '100%' }}>
            {/* Student actions */}
            {completion ? (
              getStatusChip(completion.status)
            ) : canRequestCompletion ? (
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleComplete(params.row.id)}
                disabled={isCompleting}
              >
                {isCompleting ? <CircularProgress size={20} /> : 'Request Completion'}
              </Button>
            ) : null}

            {/* Teacher actions - only show for quests created by this user */}
            {isTeacher && isCreator && (
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
        <Box>
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
          <Paper sx={{ width: '100%' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              rowCount={rowCount}
              loading={loading}
              pageSizeOptions={[5, 10, 25, 50]}
              paginationModel={paginationModel}
              paginationMode="server"
              onPaginationModelChange={setPaginationModel}
              sortModel={sortModel}
              sortingMode="server"
              onSortModelChange={setSortModel}
              slots={{ toolbar: GridToolbar }}
              disableRowSelectionOnClick
              autoHeight
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

      {/* Quest Info Modal */}
      <Dialog open={infoOpen} onClose={handleCloseInfo} fullWidth maxWidth="md">
        <DialogTitle>{selectedQuest?.title}</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {selectedQuest?.description}
            </Typography>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              Category
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {selectedQuest?.category?.name ?? '—'}
            </Typography>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              Points
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {selectedQuest?.category?.score ?? 0}
            </Typography>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              Created
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {selectedQuest?.created_at
                ? formatRelativeTimeWithTooltip(selectedQuest.created_at).full
                : '—'}
            </Typography>
          </Box>

          {/* Actions in modal */}
          {selectedQuest && (
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {(() => {
                const completion = getCompletionStatus(selectedQuest.id);
                const isCompleting = completingQuestId === selectedQuest.id;
                const isTeacher = user?.role === 'teacher';
                const isCreator = selectedQuest.creator_id === user?.id;
                const canRequestCompletion = !completion && !isCreator;

                return (
                  <>
                    {/* Student actions */}
                    {completion ? (
                      <Box>{getStatusChip(completion.status)}</Box>
                    ) : canRequestCompletion ? (
                      <Button
                        variant="outlined"
                        onClick={() => {
                          handleComplete(selectedQuest.id);
                          handleCloseInfo();
                        }}
                        disabled={isCompleting}
                      >
                        {isCompleting ? <CircularProgress size={20} /> : 'Request Completion'}
                      </Button>
                    ) : null}

                    {/* Teacher actions */}
                    {isTeacher && isCreator && (
                      <>
                        <Button
                          variant="contained"
                          startIcon={<PendingActionsIcon />}
                          onClick={() => {
                            navigate(`/quests/${selectedQuest.id}/pending`);
                            handleCloseInfo();
                          }}
                        >
                          View Pending Approvals
                        </Button>
                        <Button
                          variant="contained"
                          color="secondary"
                          startIcon={<GroupAddIcon />}
                          onClick={() => {
                            navigate(`/quests/${selectedQuest.id}/bulk-assign`);
                            handleCloseInfo();
                          }}
                        >
                          Bulk Assign Completions
                        </Button>
                      </>
                    )}
                  </>
                );
              })()}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInfo}>Close</Button>
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
