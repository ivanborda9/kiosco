# Catálogo de ropa con revendedoras

Sitio de venta de ropa por catálogo con carrito de compras y un sistema de
códigos de descuento para revendedoras: cada revendedora tiene un código
propio que le da un descuento a sus clientas y le genera a ella una comisión
por cada venta.

## Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **Prisma** + **PostgreSQL**
- Autenticación simple por cookie firmada para el panel de administración

## Funcionalidad

**Sitio público**
- Catálogo con filtro por categoría
- Ficha de producto con selector de cantidad
- Carrito de compras (persistido en el navegador)
- Checkout con datos de envío, campo para código de revendedora y elección
  de medio de pago: **tarjeta/Mercado Pago** (si está configurado) o
  **efectivo/transferencia** coordinando por WhatsApp
- Confirmación de pedido que muestra el estado real del pago (aprobado,
  pendiente, rechazado con botón para reintentar) o el botón de WhatsApp

**Panel de administración** (`/admin`)
- Resumen de ventas y comisiones generadas
- ABM de productos (nombre, precio, stock, categoría, imagen, alta/baja)
- ABM de revendedoras: código de descuento, % de descuento para la clienta,
  % de comisión y contraseña opcional para su panel
- Listado de pedidos con detalle y cambio de estado (pendiente, confirmado,
  enviado, cancelado)
- **Configuración** (`/admin/configuracion`): nombre de la tienda, color
  principal del sitio, título/subtítulo/imagen del banner y número de
  WhatsApp — todo editable sin tocar código ni redeployar

**Panel de revendedoras** (`/revendedora`)
- Página pública "¿Querés ser revendedora?" con botones para registrarse o
  iniciar sesión
- Registro con nombre, email, teléfono y contraseña: genera un código de
  descuento único y queda **pendiente de aprobación** (el admin la activa
  desde `/admin/revendedoras`)
- Panel propio (`/revendedora/panel`) donde cada revendedora ve su código,
  sus ventas y su comisión acumulada

El descuento se calcula sobre el subtotal del pedido; la comisión de la
revendedora se calcula sobre el total ya con el descuento aplicado.

**Reserva de cancha de fútbol** (`/cancha`)
- Calendario mensual con los turnos disponibles según el horario y la
  duración configurados; no hace falta registrarse
- El cliente elige día y horario, ingresa nombre y celular y paga la **seña**
  con Mercado Pago para confirmar el turno al instante
- Un turno con seña pendiente reserva el horario por 15 minutos; si no se
  completa el pago en ese tiempo, el turno se libera solo para otro cliente
- Confirmación con el estado del pago (aprobado, pendiente, rechazado con
  botón para reintentar)
- **Panel admin** (`/admin/cancha`): nombre de la cancha, precio del turno,
  monto de la seña, horario de apertura/cierre, duración del turno, días
  cerrados y número de WhatsApp de contacto, además del listado de reservas
  con posibilidad de cancelarlas o confirmarlas manualmente

## Cómo correrlo localmente

Necesitás una base de datos Postgres. La forma más rápida es crear una
gratis en [Neon](https://neon.tech) o [Supabase](https://supabase.com) (un
par de minutos, te dan la cadena de conexión); también podés usar un
Postgres local si ya tenés uno instalado.

```bash
npm install
cp .env.example .env   # completar DATABASE_URL y el resto de los valores
npm run db:push        # crea las tablas en la base de datos
npm run db:seed        # carga productos y revendedoras de ejemplo
npm run dev
```

Abrí http://localhost:3000 para el catálogo y http://localhost:3000/admin
para el panel (usuario/clave definidos en `.env`).

## Variables de entorno (`.env`)

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Cadena de conexión de Postgres (`postgresql://usuario:password@host:5432/db`) |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Credenciales del panel de admin |
| `ADMIN_SESSION_SECRET` | Cadena secreta larga para firmar las sesiones (admin y revendedoras) |

**Importante:** cambiá `ADMIN_PASSWORD` y `ADMIN_SESSION_SECRET` antes de
publicar el sitio. El nombre de la tienda, el color, el banner y el número
de WhatsApp se configuran desde `/admin/configuracion`, no acá.

## Cargar tus propios productos

Desde `/admin/productos` podés cargar cada producto con su nombre, precio,
stock, categoría y una URL de imagen (podés subir tus fotos a cualquier
servicio de hosting de imágenes y pegar el enlace ahí). Los productos de
ejemplo usan íconos en `public/products/` que podés reemplazar.

## Cobrar con tarjeta / Mercado Pago

El sitio usa **Checkout Pro** de Mercado Pago: la clienta paga en una
pantalla de Mercado Pago (vos no manejás datos de tarjeta) y vuelve
automáticamente al sitio con el resultado. Si no configurás estas
variables, el checkout simplemente no muestra la opción y sigue
funcionando solo con WhatsApp — no rompe nada.

1. Entrá a [mercadopago.com.ar/developers/panel](https://www.mercadopago.com.ar/developers/panel)
   con la cuenta de Mercado Pago del negocio (o creá una, es gratis).
2. Creá una aplicación ("Tus integraciones" → "Crear aplicación").
3. En "Credenciales de producción" copiá el **Access Token** (empieza con
   `APP_USR-...`). Para probar sin cobrar de verdad primero, usá las
   "Credenciales de prueba" (`TEST-...`) y las tarjetas de prueba que
   Mercado Pago provee en su documentación.
4. Cargá `MERCADOPAGO_ACCESS_TOKEN` con ese valor en Vercel (Settings →
   Environment Variables) y redeployá.
5. **Webhook (recomendado, opcional):** en la misma aplicación, sección
   "Webhooks", agregá la URL `https://tu-sitio.vercel.app/api/mercadopago/webhook`
   y copiá la "Clave secreta" que te da ahí. Cargala como
   `MERCADOPAGO_WEBHOOK_SECRET` en Vercel. Sin esto, el sitio igual detecta
   el pago apenas la clienta vuelve del checkout (por eso es opcional),
   pero el webhook es una confirmación más confiable si la clienta cierra
   la pestaña antes de volver.

**Nota:** el stock se descuenta al crear el pedido, no al confirmarse el
pago. Si una clienta abandona el pago con Mercado Pago sin completarlo, el
stock queda reservado en ese pedido; revisalo de vez en cuando en
`/admin/pedidos` (quedan como "Pendiente") y cancelalo manualmente si
corresponde liberar el stock.

## Despliegue en producción (ej. Vercel)

1. Creá una base de datos Postgres gratis en [Neon](https://neon.tech) o
   [Supabase](https://supabase.com) y copiá su cadena de conexión.
2. En el proyecto de Vercel, cargá las variables de entorno: `DATABASE_URL`
   (la de Postgres), `ADMIN_USERNAME`, `ADMIN_PASSWORD` y
   `ADMIN_SESSION_SECRET` (`MERCADOPAGO_ACCESS_TOKEN` y
   `MERCADOPAGO_WEBHOOK_SECRET` son opcionales, ver más abajo).
3. Deployá. El comando `build` (`prisma generate && prisma db push && ...`)
   crea las tablas automáticamente en cada deploy, y el seed carga los
   productos de ejemplo solo si la base está vacía (no duplica datos en
   redeploys posteriores) — no hace falta correr nada a mano.

Vercel sirve el sitio por HTTPS automáticamente, que es necesario porque la
cookie de sesión del admin se marca `Secure`.

**Importante:** no uses SQLite en un hosting serverless (Vercel, Netlify,
etc.) — su sistema de archivos es de solo lectura, así que la base de datos
no puede crearse ni escribirse ahí y todas las páginas fallan con un error
de servidor. Por eso este proyecto usa Postgres desde el principio.

**Sobre `prisma db push --accept-data-loss` en el build:** como las tablas
se sincronizan automáticamente en cada deploy (sin migraciones prolijas),
Prisma a veces pide confirmar cambios que él clasifica como "riesgosos"
(por ejemplo, agregar una restricción `unique` a una columna) aunque en la
práctica no borren nada. Se usa esta bandera para que el deploy no se corte
esperando una confirmación manual. Si en algún momento se agrega un cambio
de esquema realmente destructivo (por ejemplo, borrar una columna con datos
reales de clientas), conviene revisarlo a mano antes de deployar en lugar
de confiar en el build automático.

**Nota de seguridad:** el proyecto usa la última versión parcheada de la
rama Next.js 14 (`14.2.35`). Una divulgación menor de endpoints internos
de Server Actions ([GHSA-955p-x3mx-jcvp](https://github.com/advisories/GHSA-955p-x3mx-jcvp))
solo está resuelta en Next.js 16; migrar a esa versión mayor implica
cambios de breaking changes que quedan fuera del alcance de este proyecto.
