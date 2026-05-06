import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import PostAJob from './pages/PostJob'
import AppRoutes from './routes/AppRoutes'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <AppRoutes />
    </>
  )
}

export default App
