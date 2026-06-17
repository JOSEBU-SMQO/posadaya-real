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
  const [reservas, setReservas] = useState([])
  const [posadaId, setPosadaId] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  const [form, setForm] = useState(FORM_VACIO)
  const [guardando, setGuardando] = useState(false)
  const [formError, setFormError] = useState(null)
  const [eliminandoId, setEliminandoId] = useState(null)
  // id de la habitación en edición (null = estamos añadiendo una nueva).
  const [editandoId, setEditandoId] = useState(null)
  // id de la reserva cuyo pago se está confirmando.
  const [confirmandoId, setConfirmandoId] = useState(null)

  async function cargar() {
    setCargando(true)
    setError(null)

    // Sin selects embebidos: cargamos cada tabla por separado y cruzamos
    // los datos en JS (no dependemos de claves foráneas en PostgREST).
    const [habs, posadas, resv, hues] = await Promise.all([
      supabase
        .from('habitaciones')
        .select('id, nombre, descripcion, precio_noche, capacidad, imagen_url')
        .order('created_at', { ascending: true }),
      supabase.from('posadas').select('id').limit(1),
      supabase
        .from('reservas')
        .select(
          'id, habitacion_id, huesped_id, fecha_entrada, fecha_salida, estado, total_pagar, referencia',
        )
        .order('created_at', { ascending: false }),
      supabase.from('huespedes').select('id, nombre, telefono'),
    ])

    if (habs.error) {
      setError(habs.error.message)
    } else {
      setHabitaciones(habs.data)
    }

    if (!resv.error) {
      // Mapas id → nombre/datos para cruzar con las reservas.
      const mapaHab = new Map((habs.data ?? []).map((h) => [h.id, h]))
      const mapaHues = new Map((hues.data ?? []).map((g) => [g.id, g]))
      setReservas(
        resv.data.map((r) => ({
          ...r,
          habitacionNombre: mapaHab.get(r.habitacion_id)?.nombre ?? '—',
          huespedNombre: mapaHues.get(r.huesped_id)?.nombre ?? '—',
          huespedTelefono: mapaHues.get(r.huesped_id)?.telefono ?? '—',
        })),
      )
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

    const datos = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
      precio_noche: Number(form.precio_noche),
      capacidad: Number(form.capacidad),
      imagen_url: form.imagen_url.trim() || null,
    }

    setGuardando(true)
    const { error } = editandoId
      ? await supabase
          .from('habitaciones')
          .update(datos)
          .eq('id', editandoId)
      : await supabase
          .from('habitaciones')
          .insert({ ...datos, posada_id: posadaId })
    setGuardando(false)

    if (error) {
      setFormError(error.message)
      return
    }

    setForm(FORM_VACIO)
    setEditandoId(null)
    cargar()
  }

  const handleEditar = (habitacion) => {
    setFormError(null)
    setEditandoId(habitacion.id)
    setForm({
      nombre: habitacion.nombre ?? '',
      descripcion: habitacion.descripcion ?? '',
      precio_noche: String(habitacion.precio_noche ?? ''),
      capacidad: String(habitacion.capacidad ?? '1'),
      imagen_url: habitacion.imagen_url ?? '',
    })
    // Subimos para que el dueño vea el formulario relleno.
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelarEdicion = () => {
    setEditandoId(null)
    setForm(FORM_VACIO)
    setFormError(null)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  const handleConfirmarPago = async (reserva) => {
    setError(null)
    setConfirmandoId(reserva.id)
    const { error } = await supabase
      .from('reservas')
      .update({ estado: 'confirmada' })
      .eq('id', reserva.id)
    setConfirmandoId(null)

    if (error) {
      setError(error.message)
      return
    }

    // Reflejamos el cambio sin recargar todo.
    setReservas((prev) =>
      prev.map((r) =>
        r.id === reserva.id ? { ...r, estado: 'confirmada' } : r,
      ),
    )
  }

  const handleEliminar = async (habitacion) => {
    // Confirmación para evitar borrados accidentales.
    const ok = window.confirm(
      `¿Eliminar la habitación "${habitacion.nombre}"? Esta acción no se puede deshacer.`,
    )
    if (!ok) return

    setError(null)
    setEliminandoId(habitacion.id)
    const { error } = await supabase
      .from('habitaciones')
      .delete()
      .eq('id', habitacion.id)
    setEliminandoId(null)

    if (error) {
      setError(error.message)
      return
    }

    // Quitamos la fila del estado sin recargar todo.
    setHabitaciones((prev) => prev.filter((h) => h.id !== habitacion.id))
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
              className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-95"
            >
              Cerrar Sesión
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

        {/* Formulario: añadir / editar habitación */}
        <section className="mt-8 rounded-2xl bg-white p-5 shadow-md ring-1 ring-slate-200 sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">
            {editandoId ? 'Editar habitación' : 'Añadir habitación'}
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

            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <button
                type="submit"
                disabled={guardando}
                className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {guardando
                  ? 'Guardando…'
                  : editandoId
                    ? 'Guardar cambios'
                    : 'Añadir habitación'}
              </button>
              {editandoId && (
                <button
                  type="button"
                  onClick={handleCancelarEdicion}
                  disabled={guardando}
                  className="rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
                >
                  Cancelar
                </button>
              )}
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
                    <th className="px-5 py-3 font-semibold text-right">
                      Acciones
                    </th>
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
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleEditar(h)}
                            className="rounded-lg px-3 py-1.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEliminar(h)}
                            disabled={eliminandoId === h.id}
                            className="rounded-lg px-3 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {eliminandoId === h.id ? 'Borrando…' : 'Eliminar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Lista (móvil) */}
              <ul className="divide-y divide-slate-100 sm:hidden">
                {habitaciones.map((h) => (
                  <li
                    key={h.id}
                    className="flex items-start justify-between gap-3 px-4 py-4"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900">{h.nombre}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {h.capacidad}{' '}
                        {h.capacidad === 1 ? 'huésped' : 'huéspedes'} · $
                        {h.precio_noche} USD / noche
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleEditar(h)}
                        className="rounded-lg px-3 py-1.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEliminar(h)}
                        disabled={eliminandoId === h.id}
                        className="rounded-lg px-3 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {eliminandoId === h.id ? 'Borrando…' : 'Eliminar'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Sección: Reservas */}
        <div className="mt-10 flex items-center gap-3 border-b border-slate-200 pb-2">
          <h2 className="text-xl font-bold text-slate-900">Reservas</h2>
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            {reservas.length}
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Personas que han reservado: nombre, habitación, fecha, total y
          referencia.
        </p>
        <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-200">
          {cargando ? (
            <p className="px-5 py-6 text-sm text-slate-500">Cargando…</p>
          ) : reservas.length === 0 ? (
            <p className="px-5 py-6 text-sm text-slate-500">
              Todavía no hay reservas.
            </p>
          ) : (
            <>
              {/* Tabla (escritorio) — con scroll horizontal por si no cabe */}
              <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Huésped</th>
                    <th className="px-5 py-3 font-semibold">Teléfono</th>
                    <th className="px-5 py-3 font-semibold">Habitación</th>
                    <th className="px-5 py-3 font-semibold">Fechas</th>
                    <th className="px-5 py-3 font-semibold">Total</th>
                    <th className="px-5 py-3 font-semibold">Referencia</th>
                    <th className="px-5 py-3 font-semibold">Estado</th>
                    <th className="px-5 py-3 font-semibold text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reservas.map((r) => (
                    <tr key={r.id}>
                      <td className="px-5 py-4 font-medium text-slate-900">
                        {r.huespedNombre}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {r.huespedTelefono}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {r.habitacionNombre}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {r.fecha_entrada} → {r.fecha_salida}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        ${r.total_pagar} USD
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {r.referencia || '—'}
                      </td>
                      <td className="px-5 py-4">
                        <EstadoReserva estado={r.estado} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        {r.estado === 'pendiente' ? (
                          <button
                            type="button"
                            onClick={() => handleConfirmarPago(r)}
                            disabled={confirmandoId === r.id}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {confirmandoId === r.id
                              ? 'Confirmando…'
                              : 'Confirmar Pago'}
                          </button>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>

              {/* Lista (móvil) */}
              <ul className="divide-y divide-slate-100 sm:hidden">
                {reservas.map((r) => (
                  <li key={r.id} className="px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium text-slate-900">
                        {r.huespedNombre}
                      </p>
                      <EstadoReserva estado={r.estado} />
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {r.habitacionNombre} · ${r.total_pagar} USD
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {r.fecha_entrada} → {r.fecha_salida}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Tel: {r.huespedTelefono} · Ref: {r.referencia || '—'}
                    </p>
                    {r.estado === 'pendiente' && (
                      <button
                        type="button"
                        onClick={() => handleConfirmarPago(r)}
                        disabled={confirmandoId === r.id}
                        className="mt-3 w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {confirmandoId === r.id
                          ? 'Confirmando…'
                          : 'Confirmar Pago'}
                      </button>
                    )}
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

function EstadoReserva({ estado }) {
  const confirmada = estado === 'confirmada'
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
        confirmada
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-amber-100 text-amber-700'
      }`}
    >
      {estado}
    </span>
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
