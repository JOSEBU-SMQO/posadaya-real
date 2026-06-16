import { createClient } from '@supabase/supabase-js'

// Leemos las llaves desde las variables de entorno.
// En local vienen de .env.local; en producción hay que configurarlas
// en el panel del hosting (Vercel/Netlify/etc.), porque .env.local NO se sube.
// En Vite deben empezar por VITE_ y se acceden con import.meta.env.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// ¿Están bien configuradas las llaves? Lo exportamos para que la UI
// pueda mostrar un aviso útil en lugar de quedarse en blanco.
export const supabaseConfigurado = Boolean(supabaseUrl && supabaseAnonKey)

if (!supabaseConfigurado) {
  // Antes esto hacía `throw`, lo que tumbaba TODA la app (pantalla en
  // blanco) si faltaban las variables en el hosting. Ahora solo avisamos
  // y dejamos que cada página muestre el error con contexto.
  console.error(
    'Faltan las variables de entorno de Supabase. ' +
      'En local revisa .env.local; en producción configúralas en el panel ' +
      'del hosting (VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY) y vuelve a desplegar.',
  )
}

// Usamos valores de relleno si faltan para que el import no lance una
// excepción y rompa el render. Las consultas fallarán y la página mostrará
// el mensaje de error correspondiente.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
)
