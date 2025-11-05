import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
} from '@mui/material';
import { LeaderboardEntry, LeaderboardService } from '../dao/LeaderboardService';
import { Organization, OrganizationService } from '../dao/OrganizationService';
import { useAuth } from '../context/AuthContext';

export function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<number | 'global'>('global');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrganizations();
  }, [user]);

  useEffect(() => {
    loadLeaderboard();
  }, [selectedOrgId]);

  const loadOrganizations = async () => {
    try {
      if (user) {
        const myOrgs = await OrganizationService.getMyOrganizations();
        setOrganizations(myOrgs);
      }
    } catch (err) {
      console.error('Failed to load organizations', err);
    }
  };

  const loadLeaderboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data =
        selectedOrgId === 'global'
          ? await LeaderboardService.getGlobalLeaderboard()
          : await LeaderboardService.getOrganizationLeaderboard(selectedOrgId);
      setLeaderboard(data);
    } catch (err) {
      setError('Failed to load leaderboard');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return 'inherit';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Leaderboard</Typography>

        {user && organizations.length > 0 && (
          <FormControl sx={{ minWidth: 250 }}>
            <InputLabel>View</InputLabel>
            <Select
              value={selectedOrgId}
              label="View"
              onChange={(e) => setSelectedOrgId(e.target.value as number | 'global')}
            >
              <MenuItem value="global">Global Leaderboard</MenuItem>
              {organizations.map((org) => (
                <MenuItem key={org.id} value={org.id}>
                  {org.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Typography>Loading leaderboard...</Typography>
        </Box>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {selectedOrgId === 'global'
                ? 'Global Rankings'
                : `${organizations.find((org) => org.id === selectedOrgId)?.name} Rankings`}
            </Typography>

            {leaderboard.length === 0 ? (
              <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
                No completions yet. Be the first to complete a quest!
              </Typography>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <strong>Rank</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Name</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Email</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>Score</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leaderboard.map((entry, index) => {
                      const rank = index + 1;
                      return (
                        <TableRow
                          key={entry.id}
                          sx={{
                            backgroundColor: user?.id === entry.id ? 'action.hover' : 'inherit',
                          }}
                        >
                          <TableCell
                            sx={{
                              color: getRankColor(rank),
                              fontWeight: rank <= 3 ? 'bold' : 'normal',
                              fontSize: rank <= 3 ? '1.1rem' : 'inherit',
                            }}
                          >
                            {rank}
                          </TableCell>
                          <TableCell>
                            {entry.name}
                            {user?.id === entry.id && (
                              <Typography
                                component="span"
                                sx={{ ml: 1, color: 'primary.main', fontWeight: 'bold' }}
                              >
                                (You)
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>{entry.email}</TableCell>
                          <TableCell align="right">
                            <strong>{entry.score}</strong>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
