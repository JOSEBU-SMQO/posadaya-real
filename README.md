# 🏰 PosadaYa

## 📝 Descripción

**PosadaYa** es un **motor de reservas con pago móvil** para posadas en
Venezuela. El huésped elige su habitación, ve el precio en **dólares y
bolívares** (con tasa de cambio en vivo), hace su **pago móvil**, reporta el
**número de referencia** y avisa por **WhatsApp**. El dueño, desde un panel
privado, revisa cada reserva y **valida el pago** con un clic.

```
Reservar  →  Pagar (Pago Móvil)  →  Avisar por WhatsApp  →  El dueño valida el pago
```

## ✨ Funciones

- 💵 **Precios en Bs y $** con tasa de cambio editable por el dueño.
- 🚫📅 **Bloqueo de fechas pasadas** y validación de disponibilidad.
- 💳 **Reporte de pago móvil** con número de referencia obligatorio.
- 💬 **Aviso automático por WhatsApp** y página de confirmación.
- 🔐 **Panel de administración privado** (login con Supabase Auth).

## ⚙️ Stack

| Capa | Tecnología |
|------|-----------|
| Build / Frontend | **Vite** + React + React Router |
| Estilos | Tailwind CSS |
| Backend / Base de datos | **Supabase** (PostgreSQL, Auth, RLS) |
| Despliegue | **Vercel** |

## 🖼️ Capturas de pantalla

> Coloca tus imágenes en una carpeta `docs/` y enlázalas:

```markdown
![Inicio](docs/home.png)
![Reservar](docs/reservar.png)
![Panel Admin](docs/admin.png)
```

---

## 👤 Instrucciones para el Dueño

### Cómo entrar al panel
1. Pulsa **Admin** en la barra superior.
2. Inicia sesión con tu **correo y contraseña** (los creó el desarrollador en
   Supabase → Authentication). Nadie más puede entrar.

### Qué puedes hacer en el panel
- **💵 Actualizar la tasa de cambio:** arriba del todo, escribe la tasa oficial
  (ej. de `55` a `62`) y pulsa **Actualizar Tasa**. Los precios en bolívares de
  toda la web se recalculan con la nueva tasa.
- **🛏️ Gestionar habitaciones:** añade una nueva, **edita ✏️** (nombre, precio,
  foto) o **elimina 🗑️** las que ya no ofrezcas.
- **💰 Validar pagos:** en **Gestión de Pagos Recibidos** verás cada reserva con
  el nombre, teléfono y **número de referencia** del huésped. Cuando confirmes
  que el pago llegó, pulsa **Validar Pago ✅**: la reserva queda marcada en
  verde como *confirmada*.
- **🚪 Cerrar Sesión:** botón rojo en la esquina del panel.

### Cómo reserva un huésped
1. Elige una habitación y sus fechas (no puede elegir días pasados).
2. Ve el total en **$ y Bs** y los datos para el **pago móvil**.
3. Paga, escribe su **número de referencia** y pulsa **Avisar por WhatsApp**
   (te llega el mensaje con todos los datos).
4. La reserva aparece en tu panel como *pendiente* hasta que la valides.

---

## 🛠️ Puesta en marcha (desarrollador)

1. **Variables de entorno** — crea `.env.local` (y configúralas también en
   Vercel):
   ```
   VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   ```
2. **Base de datos** — en Supabase → SQL Editor, ejecuta
   `supabase/APLICAR_TODO.sql`.
3. **Usuario dueño** — créalo en Supabase → Authentication → Users.
4. **Comandos**
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
  migrations/      0001..0009
  APLICAR_TODO.sql Script consolidado e idempotente
vercel.json        Rewrites SPA (evita 404 al refrescar)
```
