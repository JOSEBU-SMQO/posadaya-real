import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const FORM_VACIO = {
  nombre: '',
  email: '',
  telefono: '',
  llegada: '',
  salida: '',
}

function Reservar() {
  // La habitación se identifica por UUID en la URL (?habitacion=UUID).
  const [searchParams] = useSearchParams()
  const habitacionId = searchParams.get('habitacion')

  const [habitacion, setHabitacion] = useState(null)
  const [cargando, setCargando] = useState(true)

  const [form, setForm] = useState(FORM_VACIO)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const [exito, setExito] = useState(false)

  useEffect(() => {
    let activo = true

    async function cargar() {
      if (!habitacionId) {
        setCargando(false)
        return
      }

      const { data, error } = await supabase
        .from('habitaciones')
        .select('id, nombre, precio_noche')
        .eq('id', habitacionId)
        .maybeSingle()

      if (!activo) return
      if (!error) setHabitacion(data)
      setCargando(false)
    }

    cargar()
    return () => {
      activo = false
    }
  }, [habitacionId])

  // Nº de noches entre las fechas elegidas (0 si no son válidas).
  const noches =
    form.llegada && form.salida
      ? Math.round(
          (new Date(form.salida) - new Date(form.llegada)) /
            (1000 * 60 * 60 * 24),
        )
      : 0

  const total =
    habitacion && noches > 0 ? noches * Number(habitacion.precio_noche) : 0

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!habitacion) {
      setError('Selecciona una habitación válida desde la página de inicio.')
      return
    }
    if (noches <= 0) {
      setError('Revisa las fechas: la salida debe ser posterior a la llegada.')
      return
    }

    setEnviando(true)
    const { error } = await supabase.rpc('crear_reserva', {
      p_habitacion_id: habitacion.id,
      p_nombre: form.nombre,
      p_email: form.email,
      p_telefono: form.telefono,
      p_fecha_entrada: form.llegada,
      p_fecha_salida: form.salida,
    })
    setEnviando(false)

    if (error) {
      setError(error.message)
      return
    }

    setExito(true)
    setForm(FORM_VACIO)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Cabecera */}
      <header className="bg-gradient-to-br from-slate-900 to-emerald-900 text-white">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
          <Link
            to="/"
            className="text-sm font-semibold text-emerald-400 hover:text-emerald-300"
          >
            ← Volver a las habitaciones
          </Link>
          <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
            Reservar habitación
          </h1>
          {habitacion && (
            <p className="mt-2 text-sm text-slate-300 sm:text-base">
              {habitacion.nombre} · ${habitacion.precio_noche} USD / noche
            </p>
          )}
        </div>
      </header>

      {/* Contenido */}
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        {cargando ? (
          <p className="text-sm text-slate-500">Cargando habitación…</p>
        ) : !habitacion ? (
          <div className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-slate-200">
            <p className="text-slate-700">
              No encontramos la habitación seleccionada.
            </p>
            <Link
              to="/"
              className="mt-4 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Ver habitaciones
            </Link>
          </div>
        ) : exito ? (
          <div className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-emerald-200 sm:p-8">
            <h2 className="text-xl font-bold text-emerald-700">
              ¡Reserva confirmada! 🎉
            </h2>
            <p className="mt-2 text-slate-600">
              Hemos registrado tu reserva para{' '}
              <span className="font-semibold">{habitacion.nombre}</span>. Te
              contactaremos para confirmar los detalles.
            </p>
            <Link
              to="/"
              className="mt-5 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Volver al inicio
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl bg-white p-5 shadow-md ring-1 ring-slate-200 sm:p-8"
          >
            {/* Fechas */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="llegada"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Fecha de llegada
                </label>
                <input
                  id="llegada"
                  name="llegada"
                  type="date"
                  required
                  value={form.llegada}
                  onChange={handleChange}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
              <div>
                <label
                  htmlFor="salida"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Fecha de salida
                </label>
                <input
                  id="salida"
                  name="salida"
                  type="date"
                  required
                  value={form.salida}
                  onChange={handleChange}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
            </div>

            {/* Datos del huésped */}
            <div className="mt-5">
              <label
                htmlFor="nombre"
                className="block text-sm font-semibold text-slate-700"
              >
                Nombre del huésped
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                required
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ej. María García"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Correo (opcional)
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="maria@correo.com"
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
              <div>
                <label
                  htmlFor="telefono"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Teléfono (opcional)
                </label>
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  value={form.telefono}
                  onChange={handleChange}
                  placeholder="+58 412 000 0000"
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>
            </div>

            {/* Total estimado */}
            {noches > 0 && (
              <p className="mt-5 text-sm text-slate-600">
                {noches} {noches === 1 ? 'noche' : 'noches'} ·{' '}
                <span className="font-semibold text-slate-900">
                  ${total} USD
                </span>{' '}
                en total
              </p>
            )}

            {error && (
              <p className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="mt-7 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {enviando ? 'Confirmando…' : 'Confirmar reserva'}
            </button>
          </form>
        )}
      </main>
    </div>
  )
}

export default Reservar
