import { Link } from 'react-router-dom'

// Barra de navegación presente en todas las páginas.
function Navbar() {
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
        </div>
      </div>
    </nav>
  )
}

export default Navbar
