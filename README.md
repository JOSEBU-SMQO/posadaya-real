# 🏰 PosadaYa - Motor de Reservas Real

### 🔗 App en vivo

**👉 https://posadaya.vercel.app**

> Reemplaza el enlace de arriba por la URL real de tu despliegue en Vercel.

## ¿Qué es?

Una app diseñada para que las **posadas venezolanas** gestionen sus reservas,
reciban **pagos móviles** y confirmen vía **WhatsApp**.

## ✨ Funciones clave

- 🖼️ **Galería dinámica** — las habitaciones se cargan en tiempo real desde
  **Supabase**.
- 💳 **Pago móvil integrado** — el huésped paga y reporta su número de
  referencia desde la misma pantalla.
- 💱 **Cálculo de Bs/$ en tiempo real** — el sistema guarda la **tasa del dólar
  en Supabase** (tabla `posadas`). El dueño la actualiza desde su panel y, al
  instante, todos los precios en bolívares de la web se recalculan con esa tasa.
  El huésped nunca la edita; solo la ve.
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
