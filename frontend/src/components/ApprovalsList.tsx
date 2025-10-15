import { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Typography, Tabs, Tab, Alert } from '@mui/material';
import {
  Organization,
  OrganizationMembership,
  OrganizationService,
} from '../dao/OrganizationService';
import { useAuth } from '../context/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`approvals-tabpanel-${index}`}
      aria-labelledby={`approvals-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `approvals-tab-${index}`,
    'aria-controls': `approvals-tabpanel-${index}`,
  };
}

export function ApprovalsList() {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [myPendingApplications, setMyPendingApplications] = useState<Organization[]>([]);
  const [adminOrganizations, setAdminOrganizations] = useState<Organization[]>([]);
  const [pendingApplications, setPendingApplications] = useState<
    Record<number, OrganizationMembership[]>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load my pending applications
      const pending = await OrganizationService.getMyPendingApplications();
      setMyPendingApplications(pending);

      // Load organizations where I'm an admin
      const myOrgs = await OrganizationService.getMyOrganizations();
      const adminOrgs = myOrgs.filter((org) => org.role === 'admin');
      setAdminOrganizations(adminOrgs);

      // Load pending applications for each organization I admin
      const applications: Record<number, OrganizationMembership[]> = {};
      await Promise.all(
        adminOrgs.map(async (org) => {
          const orgApplications = await OrganizationService.getPendingApplications(org.id);
          applications[org.id] = orgApplications;
        })
      );
      setPendingApplications(applications);
    } catch (err) {
      setError('Failed to load approvals');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleApprove = async (membershipId: number) => {
    try {
      await OrganizationService.updateMembership(membershipId, 'active');
      loadData(); // Refresh data after approval
    } catch (err) {
      setError('Failed to approve application');
      console.error(err);
    }
  };

  const handleReject = async (membershipId: number) => {
    try {
      await OrganizationService.updateMembership(membershipId, 'rejected');
      loadData(); // Refresh data after rejection
    } catch (err) {
      setError('Failed to reject application');
      console.error(err);
    }
  };

  const handleCancel = async (orgId: number) => {
    try {
      // We need to find the membership ID for this organization
      const membership = await OrganizationService.getMembershipForOrganization(orgId);
      if (membership) {
        await OrganizationService.leave(membership.id);
        loadData(); // Refresh data after cancellation
      }
    } catch (err) {
      setError('Failed to cancel application');
      console.error(err);
    }
  };

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Please log in to view approvals.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Approvals
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Typography>Loading approvals...</Typography>
        </Box>
      ) : (
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="approval tabs">
              <Tab label="My Applications" {...a11yProps(0)} />
              <Tab
                label={`Pending Approvals (${Object.values(pendingApplications).flat().length})`}
                {...a11yProps(1)}
                disabled={adminOrganizations.length === 0}
              />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            {myPendingApplications.length === 0 ? (
              <Typography>No pending applications</Typography>
            ) : (
              <Box sx={{ display: 'grid', gap: 2 }}>
                {myPendingApplications.map((org) => (
                  <Card key={org.id}>
                    <CardContent>
                      <Typography variant="h6">{org.name}</Typography>
                      <Typography color="textSecondary" sx={{ mb: 2 }}>
                        {org.description}
                      </Typography>
                      <Button variant="outlined" color="error" onClick={() => handleCancel(org.id)}>
                        Cancel Application
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {adminOrganizations.length === 0 ? (
              <Typography>You are not an admin of any organizations</Typography>
            ) : (
              <Box sx={{ display: 'grid', gap: 3 }}>
                {adminOrganizations.map((org) => {
                  const orgApplications = pendingApplications[org.id] || [];
                  return (
                    <Card key={org.id}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          {org.name}
                        </Typography>

                        {orgApplications.length === 0 ? (
                          <Typography color="textSecondary">No pending applications</Typography>
                        ) : (
                          <Box sx={{ display: 'grid', gap: 2 }}>
                            {orgApplications.map((application) => (
                              <Box
                                key={application.id}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  p: 2,
                                  border: 1,
                                  borderColor: 'divider',
                                  borderRadius: 1,
                                }}
                              >
                                <Box>
                                  <Typography variant="subtitle1">
                                    {application.user.name}
                                  </Typography>
                                  <Typography color="textSecondary" variant="body2">
                                    {application.user.email}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleApprove(application.id)}
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => handleReject(application.id)}
                                  >
                                    Reject
                                  </Button>
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            )}
          </TabPanel>
        </Box>
      )}
    </Box>
  );
}
