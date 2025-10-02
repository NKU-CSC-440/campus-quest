import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
} from '@mui/material';
import ReportIcon from '@mui/icons-material/BarChart';
import QuestIcon from '@mui/icons-material/PriorityHigh';
import ApprovalsIcon from '@mui/icons-material/Checklist';
import SettingsIcon from '@mui/icons-material/Settings';

const expandedWidth = 240;
const collapsedWidth = 64;

type Props = {
  collapsed: boolean;
};

export default function SideBar({ collapsed }: Props) {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? collapsedWidth : expandedWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: collapsed ? collapsedWidth : expandedWidth,
          transition: 'width 0.3s',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column', // 👈 makes it easy to push settings to bottom
          justifyContent: 'space-between',
        },
      }}
    >
      {/* Top section */}
      <Box>
        <Toolbar />
        <Divider />
        <List>
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton sx={{ justifyContent: collapsed ? 'center' : 'initial', px: 2.5 }}>
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: collapsed ? 'auto' : 2,
                  justifyContent: 'center',
                }}
              >
                <QuestIcon />
              </ListItemIcon>
              {!collapsed && <ListItemText primary="Quests" />}
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton sx={{ justifyContent: collapsed ? 'center' : 'initial', px: 2.5 }}>
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: collapsed ? 'auto' : 2,
                  justifyContent: 'center',
                }}
              >
                <ReportIcon />
              </ListItemIcon>
              {!collapsed && <ListItemText primary="Leaderboards" />}
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton sx={{ justifyContent: collapsed ? 'center' : 'initial', px: 2.5 }}>
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: collapsed ? 'auto' : 2,
                  justifyContent: 'center',
                }}
              >
                <ApprovalsIcon />
              </ListItemIcon>
              {!collapsed && <ListItemText primary="Approvals" />}
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      {/* Bottom section */}
      <Box>
        <Divider />
        <List>
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton sx={{ justifyContent: collapsed ? 'center' : 'initial', px: 2.5 }}>
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: collapsed ? 'auto' : 2,
                  justifyContent: 'center',
                }}
              >
                <SettingsIcon />
              </ListItemIcon>
              {!collapsed && <ListItemText primary="Settings" />}
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
}
