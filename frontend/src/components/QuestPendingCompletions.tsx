import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { CompletionService, Completion } from '../dao/CompletionService';

interface QuestPendingCompletionsProps {
  questId: number;
}

const QuestPendingCompletions: React.FC<QuestPendingCompletionsProps> = ({ questId }) => {
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [snack, setSnack] = useState<{
    open: boolean;
    msg: string;
    severity: 'success' | 'error';
  }>({ open: false, msg: '', severity: 'success' });

  const fetchPendingCompletions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CompletionService.getPendingCompletions(questId);
      setCompletions(data);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('You are not authorized to view pending completions for this quest.');
      } else {
        setError('Failed to load pending completions');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCompletions();
  }, [questId]);

  const handleApprove = async (completionId: number) => {
    try {
      setProcessingId(completionId);
      await CompletionService.approveCompletion(completionId);
      setCompletions((prev) => prev.filter((c) => c.id !== completionId));
      setSnack({
        open: true,
        msg: 'Completion approved successfully',
        severity: 'success',
      });
    } catch (e: any) {
      setSnack({
        open: true,
        msg: e.message || 'Failed to approve completion',
        severity: 'error',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (completionId: number) => {
    try {
      setProcessingId(completionId);
      await CompletionService.rejectCompletion(completionId);
      setCompletions((prev) => prev.filter((c) => c.id !== completionId));
      setSnack({
        open: true,
        msg: 'Completion rejected',
        severity: 'success',
      });
    } catch (e: any) {
      setSnack({
        open: true,
        msg: e.message || 'Failed to reject completion',
        severity: 'error',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'user.name',
      headerName: 'Student',
      flex: 1,
      valueGetter: (_value: any, row: any) => row.user?.name || 'Unknown',
    },
    {
      field: 'user.email',
      headerName: 'Email',
      flex: 1,
      valueGetter: (_value: any, row: any) => row.user?.email || '',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="contained"
            color="success"
            startIcon={<CheckIcon />}
            onClick={() => handleApprove(params.row.id)}
            disabled={processingId === params.row.id}
          >
            Approve
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            startIcon={<CloseIcon />}
            onClick={() => handleReject(params.row.id)}
            disabled={processingId === params.row.id}
          >
            Reject
          </Button>
        </Box>
      ),
    },
  ];

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (completions.length === 0) {
    return (
      <Container>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">No pending completion requests</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <>
      <Container>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h5" gutterBottom>
            Pending Completion Requests
          </Typography>
          <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={completions}
              columns={columns}
              pageSizeOptions={[5, 10, 25]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } },
              }}
            />
          </Box>
        </Paper>
      </Container>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </>
  );
};

export default QuestPendingCompletions;
