# PosadaYa 🏨

> Sistema de reservas para posadas en Venezuela, con precios en **dólares y
> bolívares**, reporte de **pago móvil** y panel de administración.

---

## ¿Qué es PosadaYa?

**PosadaYa** es una aplicación web que le permite a una posada recibir reservas
en línea sin complicaciones. El huésped elige su habitación, ve el precio en
USD y Bs, hace su **pago móvil**, reporta el número de referencia y avisa por
**WhatsApp**. El dueño, desde un panel privado, revisa las reservas y **valida
los pagos** con un clic.

Pensada para el día a día real de una posada: tasa de cambio que cambia seguido,
pagos por transferencia/pago móvil y confirmación por WhatsApp.

## Flujo de uso

```
Reservar  →  Pagar (Pago Móvil)  →  Avisar por WhatsApp  →  Admin valida el pago
```

1. El huésped reserva una habitación y elige fechas.
2. La app calcula el total (noches × precio) en **$ y Bs** y muestra los datos
   de pago móvil.
3. El huésped paga, escribe su **número de referencia** y avisa por WhatsApp.
4. El dueño entra al panel `/admin`, ve la reserva y pulsa **Validar Pago ✅**.

## Funciones principales

- 💵 **Gestión en Bs y $** — el precio se muestra en dólares y su equivalente en
  bolívares. La **tasa de cambio** se guarda en la base de datos y el dueño la
  actualiza desde el panel; el huésped nunca la edita.
- 🚫📅 **Bloqueo de fechas pasadas** — el formulario no deja seleccionar días
  anteriores a hoy, y la fecha de salida no puede ser anterior a la de llegada.
- ✅ **Comprobación de disponibilidad** — antes de reservar, verifica que las
  fechas no choquen con otra reserva activa (y vuelve a validar en el servidor
  para evitar choques simultáneos).
- 💳 **Reporte de pago móvil** — tarjeta con los datos del pago y campo
  obligatorio para el número de referencia, que se guarda en la reserva.
- 💬 **Aviso por WhatsApp** — botón que abre WhatsApp con un mensaje automático
  (habitación, noches, total en $/Bs y referencia).
- 🔐 **Panel de administración (privado)** — login con Supabase Auth; rutas
  protegidas. Permite:
  - Crear / **editar ✏️** / **eliminar 🗑️** habitaciones.
  - Ver **Gestión de Pagos Recibidos**: huésped, teléfono y número de
    referencia.
  - **Validar Pago ✅** (estado `pendiente` → `confirmada`).
  - Actualizar la tasa de cambio para toda la web.

## Tecnologías

| Capa | Herramienta |
|------|-------------|
| Frontend | **React** + Vite + React Router |
| Estilos | **Tailwind CSS** v4 |
| Backend / BD | **Supabase** (PostgreSQL, Auth, RLS, PostgREST) |
| Despliegue | **Vercel** |

## Capturas de pantalla

> Añade tus imágenes en una carpeta `docs/` y enlázalas aquí.

| Inicio | Reservar | Panel Admin |
|--------|----------|-------------|
| `docs/home.png` | `docs/reservar.png` | `docs/admin.png` |

```markdown
![Inicio](docs/home.png)
![Reservar](docs/reservar.png)
![Admin](docs/admin.png)
```

## Puesta en marcha

1. **Variables de entorno** — crea `.env.local`:
   ```
   VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   ```
   En Vercel, configúralas en *Project → Settings → Environment Variables*.

2. **Base de datos** — en Supabase → SQL Editor, ejecuta
   `supabase/APLICAR_TODO.sql` (políticas RLS, vista de ocupación y la función
   `crear_reserva`).

3. **Usuario dueño** — créalo en Supabase → Authentication → Users (no hay
   registro público; solo el dueño accede a `/admin`).

4. **Desarrollo y build**
   ```bash
   npm install
   npm run dev      # desarrollo
   npm run build    # producción
   ```

## Estructura del proyecto

```
src/
  pages/       Home, Reservar, Admin, Login
  components/  Navbar, RoomCard, ProtectedRoute
  context/     AuthContext (sesión vía onAuthStateChange)
  lib/         supabase.js (cliente)
supabase/
  migrations/      0001..0008 (esquema + políticas + funciones)
  APLICAR_TODO.sql Script consolidado e idempotente
vercel.json        Rewrites para SPA (evita 404 al refrescar)
```

## Seguridad (RLS)

- **Público (anon):** solo lee habitaciones y posadas, y crea reservas mediante
  la función `crear_reserva`. No puede leer reservas ni datos de otros huéspedes.
- **Dueño (authenticated):** gestiona habitaciones, lee y valida reservas, y
  actualiza la tasa de cambio.
