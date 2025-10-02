import { useState } from "react";
import { Box, Toolbar } from "@mui/material";
import MenuAppBar from "./AppBar";
import SideBar from "./SideBar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(true);
  const toggleCollapse = () => setCollapsed((prev) => !prev);

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* AppBar with hamburger toggle */}
      <MenuAppBar toggleCollapse={toggleCollapse} />

      {/* Sidebar */}
      <SideBar collapsed={collapsed} />

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: `calc(100% - ${collapsed ? 64 : 240}px)`,
          transition: "width 0.3s",
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
