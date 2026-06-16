import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Envuelve rutas privadas: si no hay sesión, redirige a /login.
function ProtectedRoute({ children }) {
  const { session, cargando } = useAuth()

  // Mientras comprobamos la sesión evitamos parpadeos / redirecciones
  // prematuras (al recargar la página la sesión tarda un instante).
  if (cargando) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-500">
        Comprobando sesión…
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
