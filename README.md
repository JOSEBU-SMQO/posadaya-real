# 🏰 PosadaYa - Motor de Reservas Inteligente

### 🔗 App en vivo

**👉 https://posadaya.vercel.app**

> Reemplaza el enlace por la URL real de tu despliegue en Vercel.

---

## 🎯 ¿Qué problema resuelve?

Ayuda a las **posadas en Venezuela** a **digitalizar su catálogo** de
habitaciones y **recibir pagos móviles** sin complicaciones. Olvídate de
anotar reservas en un cuaderno: los huéspedes reservan y reportan su pago en
línea, y tú confirmas con un clic.

## ✨ Funciones clave

- 🖼️ **Galería dinámica** — las habitaciones se cargan en vivo desde Supabase.
- 📅 **Reservas con disponibilidad** — bloquea fechas pasadas y ocupadas.
- 💱 **Multi-moneda en tiempo real** — precios en **$ y Bs** según la tasa del
  dólar guardada en Supabase.
- 💳 **Pago móvil + referencia** — el huésped reporta su número de referencia.
- 💬 **Aviso por WhatsApp** — mensaje automático al posadero.
- 🔐 **Panel Admin privado** — protegido con login.

## ⚙️ Stack Tecnológico

| Tecnología | Rol |
|:----------:|-----|
| ⚛️ **React** | Interfaz de usuario (con Vite) |
| 🎨 **Tailwind CSS** | Estilos y diseño responsive |
| 🟢 **Supabase** | Base de datos (DB) y autenticación (Auth) |
| ▲ **Vercel** | Hosting y despliegue |

## 📱 ¿Cómo funciona? (huésped)

```
🛏️ Reserva  →  💳 Paga (Pago Móvil)  →  💬 Avisa por WhatsApp  →  ✅ El dueño valida
```

## 👤 Instrucciones para el Administrador

1. **🔐 Login**
   Pulsa **Admin** en la barra superior e inicia sesión con tu correo y
   contraseña (creados en Supabase → Authentication). Solo tú puedes entrar.

2. **💱 Ajuste de tasa**
   Arriba del panel, en la tarjeta de tasa de cambio, escribe la tasa oficial
   del día (ej. `55` → `62`) y pulsa **Actualizar Tasa**. Los precios en
   bolívares de toda la web se recalculan al instante.

3. **✅ Verificación de reservas**
   En **Gestión de Pagos Recibidos** revisa cada reserva con el nombre,
   teléfono y **número de referencia** del huésped. Cuando confirmes que el
   pago llegó, pulsa **Validar Pago ✅**: la reserva pasa a **verde (Pagada)**.
   Las pendientes se ven en **ámbar (⏳ Pendiente)**.

   > También puedes **añadir ✏️ / editar / eliminar 🗑️** habitaciones desde el
   > mismo panel.

## 🛠️ Puesta en marcha (desarrollador)

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
