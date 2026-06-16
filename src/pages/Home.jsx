import { useEffect, useState } from 'react'
import { supabase, supabaseConfigurado } from '../lib/supabase'
import RoomCard from '../components/RoomCard'

function Home() {
  const [habitaciones, setHabitaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Evita actualizar el estado si el componente se desmonta a mitad de carga.
    let activo = true

    async function cargarHabitaciones() {
      setCargando(true)
      setError(null)

      // Si faltan las llaves (típico en producción si no se configuraron
      // en el hosting), avisamos con contexto en vez de fallar en silencio.
      if (!supabaseConfigurado) {
        setError(
          'La conexión con Supabase no está configurada. Revisa las variables ' +
            'de entorno (VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY) en el hosting.',
        )
        setHabitaciones([])
        setCargando(false)
        return
      }

      const { data, error } = await supabase
        .from('habitaciones')
        .select('id, nombre, descripcion, precio_noche, capacidad, imagen_url')
        .order('precio_noche', { ascending: true })

      if (!activo) return

      if (error) {
        setError(error.message)
        setHabitaciones([])
      } else {
        // Adaptamos los nombres de columna de la BD (snake_case) a los
        // que espera RoomCard. La BD aún no modela disponibilidad, así
        // que de momento todas se muestran como disponibles.
        setHabitaciones(
          data.map((h) => ({
            id: h.id,
            nombre: h.nombre,
            descripcion: h.descripcion,
            capacidad: h.capacidad,
            precioPorNoche: h.precio_noche,
            imagen: h.imagen_url,
            disponible: true,
          })),
        )
      }

      setCargando(false)
    }

    cargarHabitaciones()

    return () => {
      activo = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Cabecera */}
      <header className="bg-gradient-to-br from-slate-900 to-emerald-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 sm:text-sm">
            Bienvenido
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-5xl">
            Posada<span className="text-emerald-400">Ya</span>
          </h1>
          <p className="mt-3 max-w-md text-sm text-slate-300 sm:text-base">
            Elige tu habitación y reserva tu estancia en unos pocos clics.
          </p>
        </div>
      </header>

      {/* Galería de habitaciones */}
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
          Nuestras habitaciones
        </h2>

        {cargando && (
          <p className="mt-6 text-sm text-slate-500">Cargando habitaciones…</p>
        )}

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
            No se pudieron cargar las habitaciones: {error}
          </div>
        )}

        {!cargando && !error && habitaciones.length === 0 && (
          <p className="mt-6 text-sm text-slate-500">
            No hay habitaciones disponibles
          </p>
        )}

        {!cargando && !error && habitaciones.length > 0 && (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:mt-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {habitaciones.map((habitacion) => (
              <RoomCard key={habitacion.id} habitacion={habitacion} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Home
