import { Link } from 'react-router-dom'

// Tarjeta que muestra los datos de una habitación.
function RoomCard({ habitacion }) {
  const {
    id,
    nombre,
    descripcion,
    capacidad,
    precioPorNoche,
    imagen,
    disponible,
  } = habitacion

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl">
      {/* Foto de la habitación */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={imagen}
          alt={nombre}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <span
          className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${
            disponible
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-700 text-slate-200'
          }`}
        >
          {disponible ? 'Disponible' : 'Ocupada'}
        </span>
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-slate-900">{nombre}</h3>
        <p className="mt-1 text-sm text-slate-500">
          {capacidad} {capacidad === 1 ? 'huésped' : 'huéspedes'}
        </p>
        <p className="mt-3 flex-1 text-sm text-slate-600">{descripcion}</p>

        {/* Precio + acción */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-slate-900">
            <span className="text-2xl font-bold">${precioPorNoche}</span>
            <span className="text-sm text-slate-500"> USD / noche</span>
          </p>
          {disponible ? (
            <Link
              to={`/reservar/${id}`}
              className="ml-auto rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 active:scale-95"
            >
              Reservar
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="ml-auto cursor-not-allowed rounded-lg bg-slate-300 px-4 py-2 text-sm font-semibold text-slate-500"
            >
              Reservar
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export default RoomCard
