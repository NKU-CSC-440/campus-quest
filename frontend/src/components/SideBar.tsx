import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
} from '@mui/material';
import ReportIcon from '@mui/icons-material/BarChart';
import QuestIcon from '@mui/icons-material/PriorityHigh';
import ApprovalsIcon from '@mui/icons-material/Checklist';
import GroupsIcon from '@mui/icons-material/Groups';
import { Link } from 'react-router-dom';

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
        },
      }}
    >
      <Toolbar />
      <Divider />
      <List>
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              component={Link}
              to="/"
              sx={{ justifyContent: collapsed ? 'center' : 'initial', px: 2.5 }}
            >
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
            <ListItemButton
              component={Link}
              to="/organizations"
              sx={{ justifyContent: collapsed ? 'center' : 'initial', px: 2.5 }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: collapsed ? 'auto' : 2,
                  justifyContent: 'center',
                }}
              >
                <GroupsIcon />
              </ListItemIcon>
              {!collapsed && <ListItemText primary="Organizations" />}
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              component={Link}
              to="/leaderboard"
              sx={{ justifyContent: collapsed ? 'center' : 'initial', px: 2.5 }}
            >
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
            <ListItemButton
              component={Link}
              to="/approvals"
              sx={{ justifyContent: collapsed ? 'center' : 'initial', px: 2.5 }}
            >
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
    </Drawer>
  );
}
