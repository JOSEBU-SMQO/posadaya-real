import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Reservar from './pages/Reservar'
import Exito from './pages/Exito'
import Admin from './pages/Admin'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'

function App() {
  return (
    <>
      <Navbar />
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/reservar/:id" element={<Reservar />} />
      <Route path="/exito" element={<Exito />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        }
      />
      </Routes>
    </>
  )
}

export default App
