// App.jsx
import * as React from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'

export default function App() {
  return (
    <>
      {/* Navbar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            MySite
          </Typography>
          <Button color="inherit">Login</Button>
        </Toolbar>
      </AppBar>

      {/* Page content */}
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome to MySite 👋
        </Typography>
        <Typography variant="body1" gutterBottom>
          This is your starter layout using Material UI with Roboto. 
          Add more components and play with the theme to make it yours.
        </Typography>
        <Button variant="contained" color="primary">
          Get Started
        </Button>
      </Container>
    </>
  )
}
