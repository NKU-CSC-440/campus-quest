import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserCompletions, type Completion } from '../dao/QuestDAO';
import {
  Box,
  Typography,
  Paper,
  Alert,
  Chip,
  CircularProgress,
  Grid,
  Tooltip,
} from '@mui/material';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';

import { Helmet } from 'react-helmet-async';
import { formatRelativeTimeWithTooltip } from '../utils/date';

import { OrganizationService, Organization } from '../dao/OrganizationService';

import FirstQuestIcon from '../assets/badges/first-quest.png';
import TenQuestsIcon from '../assets/badges/ten-quests.png';
import TwentyFiveQuestsIcon from '../assets/badges/twentyfive-quests.png';
import JoinedOrgIcon from '../assets/badges/joined-first-org.png';


export default function ProfilePage() {
  const { user } = useAuth();
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myOrganizations, setMyOrganizations] = useState<Organization[]>([]);

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

    if (user) loadCompletions();
  }, [user]);

  useEffect(() => {
    const loadOrganizations = async () => {
      try {
        const orgs = await OrganizationService.getMyOrganizations();
        setMyOrganizations(orgs);
      } catch (err) {
        console.error('Failed to load organizations', err);
      }
    };
    if (user) loadOrganizations();
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

  // --- Badges ---
  const badges = [];

  if (approvedCount >= 1) {
    badges.push({
      name: 'First Quest',
      description: 'Completed your first quest!',
      icon: FirstQuestIcon,
    });
  }

  if (approvedCount >= 10) {
    badges.push({
      name: 'Quest Grinder',
      description: 'Completed 10 quests!',
      icon: TenQuestsIcon,
    });
  }

  if (approvedCount >= 25) {
    badges.push({
      name: 'Campus Legend',
      description: 'Completed 25 quests!',
      icon: TwentyFiveQuestsIcon,
    });
  }

  // --- Joined First Organization ---
  if (myOrganizations.length >= 1) {
    badges.push({
      name: 'Team Player',
      description: 'Joined your first organization!',
      icon: JoinedOrgIcon,
    });
  }

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
            <Typography>
              <strong>Name:</strong> {user.name}
            </Typography>
            <Typography>
              <strong>Email:</strong> {user.email}
            </Typography>
            <Typography>
              <strong>Role:</strong> {user.role}
            </Typography>
            <Typography sx={{ mt: 2 }}>
              <strong>Total Points:</strong> {totalPoints}
            </Typography>
            <Typography>
              <strong>Quests Completed:</strong> {approvedCount}
            </Typography>
            <Typography>
              <strong>Quests Pending:</strong> {pendingCount}
            </Typography>
          </Paper>
        )}

        {/* Badges Section (only if user has badges) */}
        {badges.length > 0 && (
          <>
            <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
              Badges
            </Typography>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Grid container spacing={3} justifyContent="center" alignItems="center">
                {badges.map((badge, i) => (
                  <Grid item key={i}>
                    <Tooltip title={badge.description} arrow>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: 'background.default',
                          border: '1px solid',
                          borderColor: 'divider',
                          textAlign: 'center',
                          width: 150,
                        }}
                      >
                        <Box
                          component="img"
                          src={badge.icon}
                          alt={badge.name}
                          sx={{
                            width: 64,
                            height: 64,
                            mb: 1,
                            objectFit: 'contain',
                          }}
                        />
                        <Typography variant="subtitle1" fontWeight="bold">
                          {badge.name}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </>
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
