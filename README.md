# 🏰 PosadaYa - Sistema de Reservas Full Stack

Motor de reservas para posadas, con pago móvil y precios en dólares y bolívares.

## 📝 ¿Qué es?

- 📱 **App móvil-first** — diseñada para usarse cómodamente desde el teléfono,
  tanto para el huésped que reserva como para el dueño que administra.
- 💱 **Gestión multi-moneda** — muestra los precios en **USD** y su equivalente
  en **Bolívares**, con una tasa de cambio que el dueño actualiza en tiempo real.
- 💬 **Reporte de pagos vía WhatsApp** — el huésped paga por pago móvil, reporta
  su número de referencia y avisa al posadero por WhatsApp con un solo botón.

## ⚙️ Stack tecnológico

| Tecnología | Uso |
|-----------|-----|
| **React** | Interfaz de usuario (con Vite) |
| **Tailwind CSS** | Estilos y diseño responsive |
| **Supabase** | Base de datos (PostgreSQL) y autenticación (Auth) |
| **Vercel** | Hosting y despliegue |

## 📱 ¿Cómo funciona?

Tres pasos para el huésped:

1. **Reserva** 🛏️ — elige una habitación y sus fechas. La app comprueba que
   estén libres y calcula el total en **$ y Bs**.
2. **Paga** 💳 — realiza el **pago móvil** con los datos que muestra la app y
   escribe su **número de referencia**.
3. **Avisa** 💬 — pulsa **Avisar por WhatsApp**: se envía un mensaje automático
   al posadero con la habitación, el total y la referencia.

El dueño entra a su **panel privado** (`/admin`), ve la reserva con el número de
referencia y pulsa **Validar Pago ✅** para confirmarla.

## 👤 Para el Dueño

- **Actualizar la tasa de cambio** (arriba del panel): cambia el valor oficial
  (ej. 55 → 62) y los precios en Bs de toda la web se recalculan.
- **Gestionar habitaciones**: añadir, **editar ✏️** o **eliminar 🗑️**.
- **Validar pagos**: revisa el número de referencia y confirma la reserva.

## 🛠️ Puesta en marcha (desarrollador)

1. Crea `.env.local` (y configura lo mismo en Vercel):
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
  migrations/            Historial de migraciones 0001..0009
vercel.json              Rewrites SPA (evita 404 al refrescar)
```
