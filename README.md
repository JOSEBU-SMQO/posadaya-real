# PosadaYa 🏨

Aplicación web para gestionar las reservas de una posada en Venezuela. El
huésped reserva y reporta su pago móvil; el dueño confirma desde un panel de
administración. Precios en **USD** y **Bolívares** (tasa configurable por el
dueño).

## Flujo de la app

```
Reservar  →  Pagar (Pago Móvil)  →  Avisar por WhatsApp  →  Admin confirma
```

1. **Reservar** (`/` → `/reservar/:id`)
   - El huésped ve las habitaciones reales (tabla `habitaciones` de Supabase).
   - Elige una y selecciona fechas. La app comprueba **disponibilidad** contra
     las reservas existentes (vista `reservas_ocupacion`): si esas fechas están
     ocupadas, bloquea el botón y avisa.
   - Calcula el total automáticamente: `noches × precio`, mostrado en **$ y Bs**
     (la tasa se toma de la tabla `posadas`; el huésped no la edita).

2. **Pagar (Pago Móvil)**
   - El formulario muestra una tarjeta **💳 Datos de Pago Móvil** (banco,
     teléfono, cédula).
   - El huésped hace el pago móvil y escribe su **número de referencia**
     (obligatorio).
   - Al confirmar, se llama a la función `crear_reserva` (Supabase RPC), que de
     forma atómica: revalida disponibilidad, crea el huésped, calcula el total
     y guarda la reserva con estado **`pendiente`** y la referencia.

3. **Avisar por WhatsApp**
   - Tras guardar, aparece un botón verde que abre WhatsApp con un mensaje
     automático (habitación, noches, total en $ y Bs, número de referencia).

4. **Admin confirma** (`/admin`, protegido con login)
   - El dueño entra con Supabase Auth. La ruta está protegida: sin sesión,
     redirige a `/login`.
   - En **Gestión de Pagos Recibidos** ve cada reserva con nombre, teléfono y
     **número de referencia**.
   - Botón **Validar Pago ✅** → cambia el estado a **`confirmada`** en Supabase
     (persistente).
   - También administra habitaciones (crear / **editar ✏️** / **eliminar 🗑️**)
     y actualiza la **tasa de cambio** oficial, que afecta los precios en Bs de
     toda la web.

## Stack

- **Frontend:** React + Vite + React Router + Tailwind CSS v4
- **Backend:** Supabase (PostgreSQL + Auth + RLS + PostgREST)
- **Deploy:** Vercel (SPA con `vercel.json`)

## Estructura

```
src/
  pages/      Home, Reservar, Admin, Login
  components/  Navbar, RoomCard, ProtectedRoute
  context/    AuthContext (sesión vía onAuthStateChange)
  lib/        supabase.js (cliente)
supabase/
  migrations/      0001..0008 (esquema + políticas + funciones)
  APLICAR_TODO.sql Script consolidado e idempotente
```

## Puesta en marcha

1. **Variables de entorno** — crea `.env.local`:
   ```
   VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   ```
   En producción (Vercel), configúralas en el panel del proyecto.

2. **Base de datos** — en Supabase → SQL Editor, ejecuta
   `supabase/APLICAR_TODO.sql` (políticas RLS, vista de ocupación y la función
   `crear_reserva`).

3. **Usuario dueño** — créalo en Supabase → Authentication → Users (no hay
   registro público; solo el dueño accede a `/admin`).

4. **Desarrollo**
   ```bash
   npm install
   npm run dev
   ```

5. **Build**
   ```bash
   npm run build
   ```

## Seguridad (RLS)

- **Público (anon):** solo lee habitaciones y posadas, y crea reservas a través
  de la función `crear_reserva` (no puede leer reservas ni datos de otros
  huéspedes).
- **Dueño (authenticated):** gestiona habitaciones, lee y confirma reservas, y
  actualiza la tasa de cambio.
