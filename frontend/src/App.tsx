import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Button } from "./components/Button"


function App() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Hello world 👋</h1>
      <Button>Click me</Button>
      <Button className="bg-secondary text-secondary-foreground">
        Secondary button
      </Button>
    </div>
  )
}

export default App
