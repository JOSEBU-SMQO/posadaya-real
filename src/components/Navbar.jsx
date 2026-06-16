import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

// Barra de navegación presente en todas las páginas.
function Navbar() {
  const { session } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/', { replace: true })
  }

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Marca a la izquierda */}
        <Link to="/" className="text-lg font-bold text-slate-900">
          Posada<span className="text-emerald-600">Ya</span>
        </Link>

        {/* Enlaces a la derecha */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/"
            className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Inicio
          </Link>
          <Link
            to="/admin"
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Admin
          </Link>

          {/* Cerrar sesión: solo visible si hay sesión iniciada. */}
          {session && (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Cerrar Sesión
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
