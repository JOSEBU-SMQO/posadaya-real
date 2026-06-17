# 🏰 PosadaYa - Motor de Reservas Real

## ¿Qué es?

Una app diseñada para que las **posadas venezolanas** gestionen sus reservas,
reciban **pagos móviles** y confirmen vía **WhatsApp**.

## ✨ Funciones clave

- 🖼️ **Galería dinámica** — las habitaciones se cargan en tiempo real desde
  **Supabase**.
- 💳 **Pago móvil integrado** — el huésped paga y reporta su número de
  referencia desde la misma pantalla.
- 💱 **Cálculo de Bs/$ según tasa diaria** — muestra el total en dólares y
  bolívares usando la tasa que el dueño actualiza cada día.
- 🔐 **Panel Admin privado** — gestión de habitaciones, validación de pagos y
  tasa de cambio, protegido con login.

## ⚙️ Tecnología

| Herramienta | Uso |
|-------------|-----|
| **React** | Interfaz de usuario (con Vite) |
| **Supabase** | Base de datos (PostgreSQL) y autenticación (Auth) |
| **Tailwind CSS** | Estilos y diseño responsive |
| **Vercel** | Hosting y despliegue |

## 📱 ¿Cómo funciona?

```
Reserva  →  Paga (Pago Móvil)  →  Avisa por WhatsApp  →  El dueño valida el pago
```

1. **Reserva** 🛏️ — el huésped elige habitación y fechas; la app verifica
   disponibilidad y calcula el total en $ y Bs.
2. **Paga** 💳 — realiza el pago móvil y escribe su número de referencia.
3. **Avisa** 💬 — pulsa *Avisar por WhatsApp* y le llega el mensaje al posadero.
4. **Confirma** ✅ — el dueño valida el pago desde su panel privado.

## 🛠️ Puesta en marcha

1. Crea `.env.local` (y configúralo también en Vercel):
   ```
   VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   ```
2. En Supabase → SQL Editor, ejecuta `supabase/ESQUEMA_COMPLETO.sql`.
3. Crea el usuario dueño en Supabase → Authentication → Users.
4. Comandos:
   ```bash
   npm install
   npm run dev      # desarrollo
   npm run build    # producción
   ```

## 📁 Estructura

```
src/
  pages/       Home, Reservar, Exito, Admin, Login
  components/  Navbar, RoomCard, ProtectedRoute
  context/     AuthContext (sesión vía onAuthStateChange)
  lib/         supabase.js
supabase/
  ESQUEMA_COMPLETO.sql   Script único (tablas + políticas + función)
vercel.json              Rewrites SPA (evita 404 al refrescar)
```
