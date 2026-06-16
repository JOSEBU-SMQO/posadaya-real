import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const FORM_VACIO = {
  nombre: '',
  descripcion: '',
  precio_noche: '',
  capacidad: '1',
  imagen_url: '',
}

function Admin() {
  const navigate = useNavigate()

  const [habitaciones, setHabitaciones] = useState([])
  const [posadaId, setPosadaId] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const [form, setForm] = useState(FORM_VACIO)
  const [guardando, setGuardando] = useState(false)
  const [formError, setFormError] = useState(null)

  async function cargar() {
    setCargando(true)
    setError(null)

    const [habs, posadas] = await Promise.all([
      supabase
        .from('habitaciones')
        .select('id, nombre, descripcion, precio_noche, capacidad, imagen_url')
        .order('created_at', { ascending: true }),
      supabase.from('posadas').select('id').limit(1),
    ])

    if (habs.error) {
      setError(habs.error.message)
    } else {
      setHabitaciones(habs.data)
    }

    if (!posadas.error && posadas.data.length > 0) {
      setPosadaId(posadas.data[0].id)
    }

    setCargando(false)
  }

  useEffect(() => {
    cargar()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)

    if (!posadaId) {
      setFormError('No hay ninguna posada registrada a la que asociar la habitación.')
      return
    }

    setGuardando(true)
    const { error } = await supabase.from('habitaciones').insert({
      posada_id: posadaId,
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
      precio_noche: Number(form.precio_noche),
      capacidad: Number(form.capacidad),
      imagen_url: form.imagen_url.trim() || null,
    })
    setGuardando(false)

    if (error) {
      setFormError(error.message)
      return
    }

    setForm(FORM_VACIO)
    cargar()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  const total = habitaciones.length
  const capacidadTotal = habitaciones.reduce((s, h) => s + h.capacidad, 0)
  const precioPromedio = total
    ? Math.round(habitaciones.reduce((s, h) => s + Number(h.precio_noche), 0) / total)
    : 0

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Cabecera */}
      <header className="bg-gradient-to-br from-slate-900 to-emerald-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="flex items-start justify-between gap-4">
            <Link
              to="/"
              className="text-sm font-semibold text-emerald-400 hover:text-emerald-300"
            >
              ← Volver al inicio
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Cerrar sesión
            </button>
          </div>
          <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
            Panel de administración
          </h1>
          <p className="mt-2 text-sm text-slate-300 sm:text-base">
            Gestiona las habitaciones de la posada.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Resumen */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Habitaciones" valor={total} color="text-slate-900" />
          <StatCard
            label="Capacidad total"
            valor={capacidadTotal}
            color="text-emerald-600"
          />
          <StatCard
            label="Precio promedio"
            valor={`$${precioPromedio}`}
            color="text-slate-500"
          />
        </div>

        {/* Formulario: añadir habitación */}
        <section className="mt-8 rounded-2xl bg-white p-5 shadow-md ring-1 ring-slate-200 sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">
            Añadir habitación
          </h2>

          <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Campo
              label="Nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              required
              placeholder="Ej. Suite Familiar"
            />
            <Campo
              label="Imagen (URL)"
              name="imagen_url"
              value={form.imagen_url}
              onChange={handleChange}
              type="url"
              placeholder="https://…"
            />
            <Campo
              label="Precio por noche (USD)"
              name="precio_noche"
              value={form.precio_noche}
              onChange={handleChange}
              type="number"
              min="0"
              step="0.01"
              required
              placeholder="65"
            />
            <Campo
              label="Capacidad (huéspedes)"
              name="capacidad"
              value={form.capacidad}
              onChange={handleChange}
              type="number"
              min="1"
              step="1"
              required
            />
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                rows={3}
                placeholder="Breve descripción de la habitación…"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            {formError && (
              <p className="sm:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
                {formError}
              </p>
            )}

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={guardando}
                className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {guardando ? 'Guardando…' : 'Añadir habitación'}
              </button>
            </div>
          </form>
        </section>

        {/* Tabla de habitaciones */}
        <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-200">
          {cargando ? (
            <p className="px-5 py-6 text-sm text-slate-500">Cargando…</p>
          ) : error ? (
            <p className="px-5 py-6 text-sm text-red-700">
              No se pudieron cargar las habitaciones: {error}
            </p>
          ) : habitaciones.length === 0 ? (
            <p className="px-5 py-6 text-sm text-slate-500">
              Aún no hay habitaciones. Añade la primera con el formulario.
            </p>
          ) : (
            <>
              {/* Tabla (pantallas medianas en adelante) */}
              <table className="hidden w-full text-left text-sm sm:table">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Habitación</th>
                    <th className="px-5 py-3 font-semibold">Capacidad</th>
                    <th className="px-5 py-3 font-semibold">Precio / noche</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {habitaciones.map((h) => (
                    <tr key={h.id}>
                      <td className="px-5 py-4 font-medium text-slate-900">
                        {h.nombre}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {h.capacidad}{' '}
                        {h.capacidad === 1 ? 'huésped' : 'huéspedes'}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        ${h.precio_noche} USD
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Lista (móvil) */}
              <ul className="divide-y divide-slate-100 sm:hidden">
                {habitaciones.map((h) => (
                  <li key={h.id} className="px-4 py-4">
                    <p className="font-medium text-slate-900">{h.nombre}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {h.capacidad} {h.capacidad === 1 ? 'huésped' : 'huéspedes'} ·
                      ${h.precio_noche} USD / noche
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

function StatCard({ label, valor, color }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${color}`}>{valor}</p>
    </div>
  )
}

function Campo({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input
        {...props}
        className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
      />
    </div>
  )
}

export default Admin
