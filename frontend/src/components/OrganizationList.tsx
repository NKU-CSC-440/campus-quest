import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
} from '@mui/material';
import { Organization, OrganizationService } from '../dao/OrganizationService';
import { useAuth } from '../context/AuthContext';

export function OrganizationList() {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [myOrganizations, setMyOrganizations] = useState<Organization[]>([]);
  const [pendingApplications, setPendingApplications] = useState<Organization[]>([]);
  const [rejectedApplications, setRejectedApplications] = useState<Organization[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgDescription, setNewOrgDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]); // Add user to dependency array so we reload when user changes

  const loadData = async () => {
    setIsLoading(true);
    try {
      // First load pending applications and my organizations to ensure we have this data
      // before showing any Apply buttons
      if (user) {
        const [pending, rejected, myOrgs] = await Promise.all([
          OrganizationService.getMyPendingApplications(),
          OrganizationService.getMyRejectedApplications(),
          OrganizationService.getMyOrganizations(),
        ]);
        setPendingApplications(pending);
        setRejectedApplications(rejected);
        setMyOrganizations(myOrgs);
      } else {
        setPendingApplications([]);
        setRejectedApplications([]);
        setMyOrganizations([]);
      }

      // Then load the organizations
      const orgs = await OrganizationService.getAll();
      setOrganizations(orgs);
    } catch (err) {
      setError('Failed to load organizations');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrganization = async () => {
    try {
      await OrganizationService.create(newOrgName, newOrgDescription);
      setCreateDialogOpen(false);
      setNewOrgName('');
      setNewOrgDescription('');
      loadData();
    } catch (err) {
      setError('Failed to create organization');
      console.error(err);
    }
  };

  const handleApply = async (orgId: number) => {
    try {
      await OrganizationService.apply(orgId);
      loadData();
    } catch (err) {
      setError('Failed to apply to organization');
      console.error(err);
    }
  };

  const handleLeave = async (membershipId: number) => {
    try {
      await OrganizationService.leave(membershipId);
      loadData();
    } catch (err) {
      setError('Failed to leave organization');
      console.error(err);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Organizations</Typography>
        {user && (
          <Button variant="contained" color="primary" onClick={() => setCreateDialogOpen(true)}>
            Create Organization
          </Button>
        )}
      </Box>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Typography>Loading organizations...</Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
          }}
        >
          {organizations.map((org) => {
            const isApplied = pendingApplications.some((pendingOrg) => pendingOrg.id === org.id);
            const isRejected = rejectedApplications.some(
              (rejectedOrg) => rejectedOrg.id === org.id
            );
            const membership = myOrganizations.find((memberOrg) => memberOrg.id === org.id);

            return (
              <Card key={org.id}>
                <CardContent>
                  <Typography variant="h6">{org.name}</Typography>
                  <Typography color="textSecondary">{org.description}</Typography>

                  {user && !membership && !isApplied && !isRejected && (
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleApply(org.id)}
                      sx={{ mt: 2 }}
                    >
                      Apply to Join
                    </Button>
                  )}

                  {isApplied && (
                    <Typography color="info.main" sx={{ mt: 2 }}>
                      Application Pending
                    </Typography>
                  )}

                  {isRejected && (
                    <Box sx={{ mt: 2 }}>
                      <Typography color="error">Application Rejected</Typography>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleApply(org.id)}
                        sx={{ mt: 1 }}
                      >
                        Apply Again
                      </Button>
                    </Box>
                  )}

                  {membership && (
                    <Box sx={{ mt: 2 }}>
                      <Typography color="success.main">
                        {membership.role === 'admin' ? 'Admin' : 'Member'}
                      </Typography>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => membership.membership_id && handleLeave(membership.membership_id)}
                        sx={{ mt: 1 }}
                      >
                        Leave Organization
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}{' '}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Create New Organization</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Organization Name"
            fullWidth
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={newOrgDescription}
            onChange={(e) => setNewOrgDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateOrganization} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
