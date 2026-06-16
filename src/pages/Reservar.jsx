import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const FORM_VACIO = {
  nombre: '',
  email: '',
  telefono: '',
  llegada: '',
  salida: '',
  referencia: '',
}

// Teléfono de la posada en formato internacional para wa.me
// (0412-9521225 → +58 412 9521225). wa.me exige el código de país sin "+" ni "0".
const TELEFONO_WHATSAPP = '584129521225'

function Reservar() {
  // La habitación se identifica por UUID en la ruta (/reservar/:id).
  const { id: habitacionId } = useParams()

  const [habitacion, setHabitacion] = useState(null)
  const [tasaCambio, setTasaCambio] = useState(null)
  const [cargando, setCargando] = useState(true)

  const [form, setForm] = useState(FORM_VACIO)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)
  const [exito, setExito] = useState(false)
  // Datos de la reserva confirmada (para el resumen + WhatsApp), ya que
  // limpiamos el formulario tras guardar.
  const [confirmacion, setConfirmacion] = useState(null)

  // Disponibilidad según las fechas elegidas:
  // null = aún no hay fechas | 'verificando' | 'libre' | 'ocupada' | 'error'
  const [disponibilidad, setDisponibilidad] = useState(null)

  useEffect(() => {
    let activo = true

    async function cargar() {
      if (!habitacionId) {
        setCargando(false)
        return
      }

      // 1) Buscamos la habitación.
      const { data, error } = await supabase
        .from('habitaciones')
        .select('id, nombre, precio_noche, posada_id')
        .eq('id', habitacionId)
        .maybeSingle()

      if (!activo) return
      if (error || !data) {
        setCargando(false)
        return
      }
      setHabitacion(data)

      // 2) Traemos la tasa_cambio de su posada en una consulta aparte
      //    (así no dependemos de la relación de clave foránea en PostgREST).
      if (data.posada_id) {
        const { data: posada } = await supabase
          .from('posadas')
          .select('tasa_cambio')
          .eq('id', data.posada_id)
          .maybeSingle()
        if (activo && posada) setTasaCambio(Number(posada.tasa_cambio))
      }

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

  // Consulta si la habitación está ocupada en un rango de fechas.
  // Réplica de:
  //   SELECT * FROM reservas
  //   WHERE habitacion_id = X
  //     AND NOT (fecha_entrada >= salida OR fecha_salida <= entrada)
  // que por las leyes de De Morgan equivale a:
  //     fecha_entrada < salida  AND  fecha_salida > entrada
  // Consultamos la vista segura 'reservas_ocupacion' (no expone al huésped).
  // Devuelve: 'ocupada' | 'libre' | 'error'.
  async function consultarOcupacion(entrada, salida) {
    const { data, error } = await supabase
      .from('reservas_ocupacion')
      .select('id')
      .eq('habitacion_id', habitacion.id)
      .lt('fecha_entrada', salida)
      .gt('fecha_salida', entrada)
      .limit(1)

    if (error) return 'error'
    return data.length > 0 ? 'ocupada' : 'libre'
  }

  // En cuanto el usuario termina de poner las fechas, comprobamos solapamiento.
  useEffect(() => {
    if (!habitacion || noches <= 0) {
      setDisponibilidad(null)
      return
    }

    let activo = true
    setDisponibilidad('verificando')

    consultarOcupacion(form.llegada, form.salida).then((estado) => {
      if (activo) setDisponibilidad(estado)
    })

    return () => {
      activo = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habitacion, form.llegada, form.salida, noches])

  // Total en bolívares usando la tasa_cambio cargada de la posada.
  const totalBs = total > 0 && tasaCambio ? total * tasaCambio : 0

  // Formatea cantidades en bolívares con separadores de miles.
  const formatoBs = (valor) =>
    valor.toLocaleString('es-VE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

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

    // Verificación final UNA ÚLTIMA VEZ justo antes de guardar, por si las
    // fechas se ocuparon mientras el usuario llenaba el formulario.
    const estadoFinal = await consultarOcupacion(form.llegada, form.salida)
    if (estadoFinal === 'ocupada') {
      setEnviando(false)
      setDisponibilidad('ocupada')
      setError('🚨 ¡ALERTA! Estas fechas ya están ocupadas por otro huésped')
      return
    }

    const { error } = await supabase.rpc('crear_reserva', {
      p_habitacion_id: habitacion.id,
      p_nombre: form.nombre,
      p_email: form.email,
      p_telefono: form.telefono,
      p_fecha_entrada: form.llegada,
      p_fecha_salida: form.salida,
      p_referencia: form.referencia,
    })
    setEnviando(false)

    if (error) {
      setError(error.message)
      return
    }

    // Guardamos un resumen antes de limpiar el formulario.
    setConfirmacion({
      nombre: form.nombre,
      habitacion: habitacion.nombre,
      total,
      totalBs,
      referencia: form.referencia.trim(),
    })
    setExito(true)
    setForm(FORM_VACIO)
  }

  // Construye el enlace de WhatsApp con un mensaje automático.
  const enlaceWhatsApp = (c) => {
    const lineas = [
      `Hola, soy ${c.nombre}.`,
      `He reservado la habitación: ${c.habitacion}.`,
      `Total a pagar: $${c.total} USD` +
        (c.totalBs ? ` (Bs ${formatoBs(c.totalBs)})` : ''),
      c.referencia ? `Referencia bancaria: ${c.referencia}` : null,
    ].filter(Boolean)
    return `https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(
      lineas.join('\n'),
    )}`
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
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span
              className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-600"
              aria-hidden="true"
            />
            Buscando habitación…
          </div>
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
        ) : exito && confirmacion ? (
          <div className="rounded-2xl bg-white p-6 shadow-md ring-1 ring-emerald-200 sm:p-8">
            <h2 className="text-xl font-bold text-emerald-700">
              ¡Reserva confirmada! 🎉
            </h2>
            <p className="mt-2 text-slate-600">
              Hemos registrado tu reserva para{' '}
              <span className="font-semibold">{confirmacion.habitacion}</span>.
            </p>

            {/* Resumen con conversión de moneda */}
            <div className="mt-4 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Total a pagar
                </span>
                <span className="text-right">
                  <span className="block text-xl font-bold text-slate-900">
                    ${confirmacion.total} USD
                  </span>
                  {confirmacion.totalBs > 0 && (
                    <span className="block text-sm text-slate-500">
                      Bs {formatoBs(confirmacion.totalBs)}
                    </span>
                  )}
                </span>
              </div>
              {confirmacion.referencia && (
                <p className="mt-2 border-t border-slate-200 pt-2 text-sm text-slate-600">
                  Referencia: {confirmacion.referencia}
                </p>
              )}
            </div>

            <p className="mt-4 text-sm text-slate-600">
              Envíanos el comprobante por WhatsApp para confirmar tu pago:
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              {/* Botón verde de WhatsApp */}
              <a
                href={enlaceWhatsApp(confirmacion)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 active:scale-[0.98]"
              >
                💬 Enviar pago por WhatsApp
              </a>
              <Link
                to="/"
                className="inline-flex items-center rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Volver al inicio
              </Link>
            </div>
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

            {/* Reporte de pago */}
            <div className="mt-5">
              <label
                htmlFor="referencia"
                className="block text-sm font-semibold text-slate-700"
              >
                Número de referencia bancaria
              </label>
              <input
                id="referencia"
                name="referencia"
                type="text"
                value={form.referencia}
                onChange={handleChange}
                placeholder="Ej. 0012345678 (del pago móvil / transferencia)"
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              />
            </div>

            {/* Tasa de cambio (traída de la tabla posadas) */}
            <div className="mt-5">
              <label
                htmlFor="tasa"
                className="block text-sm font-semibold text-slate-700"
              >
                Tasa de cambio (Bs por $)
              </label>
              <input
                id="tasa"
                type="text"
                readOnly
                value={tasaCambio !== null ? tasaCambio : '—'}
                className="mt-1.5 w-full cursor-default rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700"
              />
            </div>

            {/* Desglose del total */}
            {noches > 0 && (
              <div className="mt-5 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="text-sm text-slate-600">
                  {noches} {noches === 1 ? 'noche' : 'noches'} × $
                  {habitacion.precio_noche} ={' '}
                  <span className="font-semibold text-slate-900">${total}</span>
                </p>
                <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2 border-t border-slate-200 pt-3">
                  <span className="text-sm font-semibold text-slate-700">
                    Total a pagar
                  </span>
                  <span className="text-right">
                    <span className="block text-xl font-bold text-slate-900">
                      ${total} USD
                    </span>
                    {totalBs > 0 && (
                      <span className="block text-sm text-slate-500">
                        Bs {formatoBs(totalBs)}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* Reflejo visual de disponibilidad */}
            {disponibilidad === 'verificando' && (
              <p className="mt-5 text-sm text-slate-500">
                Comprobando disponibilidad…
              </p>
            )}
            {disponibilidad === 'libre' && (
              <p className="mt-5 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">
                ¡Habitación disponible!
              </p>
            )}
            {disponibilidad === 'ocupada' && (
              <div className="mt-5 rounded-xl bg-red-600 px-5 py-5 text-center text-lg font-extrabold uppercase tracking-wide text-white shadow-lg ring-4 ring-red-200 sm:text-xl">
                🚨 ¡ALERTA! Estas fechas ya están ocupadas por otro huésped
              </div>
            )}
            {disponibilidad === 'error' && (
              <p className="mt-5 rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 ring-1 ring-amber-200">
                No pudimos comprobar la disponibilidad. Por seguridad, el botón
                queda bloqueado. (¿Está aplicada la migración de la vista
                <code className="mx-1">reservas_ocupacion</code> en Supabase?)
              </p>
            )}

            {error && disponibilidad !== 'ocupada' && (
              <p className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
                {error}
              </p>
            )}

            {(() => {
              const bloqueado =
                enviando ||
                disponibilidad === 'ocupada' ||
                disponibilidad === 'verificando' ||
                disponibilidad === 'error'
              return (
                <button
                  type="submit"
                  disabled={bloqueado}
                  className={`mt-7 w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98] sm:w-auto ${
                    bloqueado
                      ? 'cursor-not-allowed bg-slate-300 text-slate-500'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {enviando ? 'Confirmando…' : 'Confirmar reserva'}
                </button>
              )
            })()}
          </form>
        )}
      </main>
    </div>
  )
}

export default Reservar
