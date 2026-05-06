import { useState } from 'react'
import './App.css'
import Home from './pages/Home'
import Login from './pages/Login'
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
