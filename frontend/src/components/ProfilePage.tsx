import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserCompletions, type Completion } from '../dao/QuestDAO';
import { Box, Typography, Paper, Alert, Chip, CircularProgress } from '@mui/material';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { Helmet } from 'react-helmet-async';
import { formatRelativeTimeWithTooltip } from '../utils/date';

export default function ProfilePage() {
  const { user } = useAuth();
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCompletions = async () => {
      try {
        setLoading(true);
        const data = await getUserCompletions();
        setCompletions(data);
      } catch (e: any) {
        setError(e.message || 'Failed to load completions');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadCompletions();
    }
  }, [user]);

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

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    {
      field: 'quest_title',
      headerName: 'Quest',
      flex: 1,
      minWidth: 200,
      valueGetter: (_value, row) => row.quest?.title || 'Unknown Quest',
    },
    {
      field: 'quest_description',
      headerName: 'Description',
      flex: 1,
      minWidth: 200,
      valueGetter: (_value, row) => row.quest?.description || '',
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 150,
      valueGetter: (_value, row) => row.quest?.category?.name || '—',
    },
    {
      field: 'points',
      headerName: 'Points',
      width: 100,
      valueGetter: (_value, row) => row.quest?.category?.score || 0,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => getStatusChip(params.value),
    },
    {
      field: 'completed_at',
      headerName: 'Completed At',
      width: 150,
      renderCell: (params) => {
        if (!params.value) return '—';
        const { display, full } = formatRelativeTimeWithTooltip(params.value);
        return (
          <span title={full} style={{ cursor: 'help' }}>
            {display}
          </span>
        );
      },
    },
  ];

  const rows = completions.map((c) => ({
    id: c.id,
    quest_title: c.quest?.title || 'Unknown Quest',
    quest_description: c.quest?.description || '',
    category: c.quest?.category?.name || '—',
    points: c.quest?.category?.score || 0,
    status: c.status,
    completed_at: c.completed_at,
    quest: c.quest,
  }));

  const totalPoints = completions
    .filter((c) => c.status === 'approved')
    .reduce((sum, c) => sum + (c.quest?.category?.score || 0), 0);

  const approvedCount = completions.filter((c) => c.status === 'approved').length;
  const pendingCount = completions.filter((c) => c.status === 'pending').length;

  return (
    <>
      <Helmet>
        <title>Profile | Campus Quest</title>
      </Helmet>

      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          Profile
        </Typography>

        {/* User Info */}
        {user && (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              User Information
            </Typography>
            <Typography variant="body1">
              <strong>Name:</strong> {user.name}
            </Typography>
            <Typography variant="body1">
              <strong>Email:</strong> {user.email}
            </Typography>
            <Typography variant="body1">
              <strong>Role:</strong> {user.role}
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              <strong>Total Points:</strong> {totalPoints}
            </Typography>
            <Typography variant="body1">
              <strong>Quests Completed:</strong> {approvedCount}
            </Typography>
            <Typography variant="body1">
              <strong>Quests Pending:</strong> {pendingCount}
            </Typography>
          </Paper>
        )}

        {/* Completions Table */}
        <Typography variant="h5" sx={{ mb: 2 }}>
          My Quest Completions
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : (
          <Paper sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              pageSizeOptions={[5, 10, 25]}
              slots={{ toolbar: GridToolbar }}
              disableRowSelectionOnClick
              sx={{ border: 0 }}
            />
          </Paper>
        )}
      </Box>
    </>
  );
}
