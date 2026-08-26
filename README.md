# Catálogo de ropa con revendedoras

Sitio de venta de ropa por catálogo con carrito de compras y un sistema de
códigos de descuento para revendedoras: cada revendedora tiene un código
propio que le da un descuento a sus clientas y le genera a ella una comisión
por cada venta.

## Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS
- **Prisma** + **SQLite** (base de datos en un archivo, sin servidor externo)
- Autenticación simple por cookie firmada para el panel de administración

## Funcionalidad

**Sitio público**
- Catálogo con filtro por categoría
- Ficha de producto con selector de cantidad
- Carrito de compras (persistido en el navegador)
- Checkout con datos de envío y campo para código de revendedora
- Confirmación de pedido con botón para coordinar por WhatsApp

**Panel de administración** (`/admin`)
- Resumen de ventas y comisiones generadas
- ABM de productos (nombre, precio, stock, categoría, imagen, alta/baja)
- ABM de revendedoras: código de descuento, % de descuento para la clienta
  y % de comisión para la revendedora
- Listado de pedidos con detalle y cambio de estado (pendiente, confirmado,
  enviado, cancelado)

El descuento se calcula sobre el subtotal del pedido; la comisión de la
revendedora se calcula sobre el total ya con el descuento aplicado.

## Cómo correrlo localmente

```bash
npm install
cp .env.example .env   # y completar los valores
npm run db:push        # crea la base de datos SQLite
npm run db:seed        # carga productos y revendedoras de ejemplo
npm run dev
```

Abrí http://localhost:3000 para el catálogo y http://localhost:3000/admin
para el panel (usuario/clave definidos en `.env`).

## Variables de entorno (`.env`)

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Ruta del archivo SQLite (por defecto `file:./dev.db`) |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Credenciales del panel de admin |
| `ADMIN_SESSION_SECRET` | Cadena secreta larga para firmar la sesión |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número de WhatsApp del negocio (formato internacional, sin `+`) |
| `NEXT_PUBLIC_STORE_NAME` | Nombre del negocio mostrado en el sitio |

**Importante:** cambiá `ADMIN_PASSWORD` y `ADMIN_SESSION_SECRET` antes de
publicar el sitio.

## Cargar tus propios productos

Desde `/admin/productos` podés cargar cada producto con su nombre, precio,
stock, categoría y una URL de imagen (podés subir tus fotos a cualquier
servicio de hosting de imágenes y pegar el enlace ahí). Los productos de
ejemplo usan íconos en `public/products/` que podés reemplazar.

## Despliegue en producción

- La cookie de sesión del admin se marca `Secure` en producción, por lo que
  el sitio debe servirse por **HTTPS** (esto es automático en plataformas
  como Vercel, Railway o Render).
- SQLite funciona bien para un catálogo chico/mediano, pero si el hosting
  usa contenedores efímeros (por ejemplo, funciones serverless) el archivo
  de base de datos no persiste entre despliegues. En ese caso, cambiá el
  `provider` de `prisma/schema.prisma` a `postgresql` y usá una base de
  datos administrada (Neon, Supabase, Railway, etc.).
- Nota de seguridad: el proyecto usa la última versión parcheada de la
  rama Next.js 14 (`14.2.35`). Una divulgación menor de endpoints internos
  de Server Actions ([GHSA-955p-x3mx-jcvp](https://github.com/advisories/GHSA-955p-x3mx-jcvp))
  solo está resuelta en Next.js 16; migrar a esa versión mayor implica
  cambios de breaking changes que quedan fuera del alcance de este proyecto.
