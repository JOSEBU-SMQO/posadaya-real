import { Link } from 'react-router-dom'

// Página de confirmación tras enviar la referencia y avisar por WhatsApp.
function Exito() {
  return (
    <div className="grid min-h-[80vh] place-items-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-md ring-1 ring-emerald-200">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-4xl">
          🏨
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-900">
          ¡Listo! Tu reporte ha sido recibido
        </h1>
        <p className="mt-3 text-slate-600">
          El posadero se pondrá en contacto pronto.
        </p>

        <Link
          to="/"
          className="mt-7 inline-block rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.98]"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}

export default Exito
