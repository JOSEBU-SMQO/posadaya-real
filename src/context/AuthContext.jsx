import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Contexto de autenticación: expone la sesión actual del dueño
// y si todavía estamos comprobándola al arrancar la app.
const AuthContext = createContext({ session: null, cargando: true })

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    // 1) Sesión existente al cargar la página (si la hay).
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setCargando(false)
    })

    // 2) Nos suscribimos a inicios/cierres de sesión para
    //    mantener el estado sincronizado en toda la app.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
      setSession(nuevaSesion)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ session, cargando }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook de conveniencia para leer la sesión desde cualquier componente.
export function useAuth() {
  return useContext(AuthContext)
}
