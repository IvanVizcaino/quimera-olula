# Tienda online — común

Base compartida por los módulos de la tienda (catálogo, producto, carrito, checkout y cuenta): storeview activo, cliente REST de la API pública, almacén del token del carrito e icono del carrito en la cabecera.

API del backend (`olula_servidor`, app `tienda_online`). Las rutas `/public/...` no exigen login. Todas las llamadas de la tienda envían la cabecera `X-Store-View: <codigo>`.

| Método | Ruta | Respuesta |
|---|---|---|
| GET | `/public/tienda_online/storeview/<codigo>` | `{datos: {codigo, nombre, idioma, url_base, website: {id, codigo, nombre, divisa}}}`; 404 si no existe |
| POST | `/public/tienda_online/carrito` | `{token}` |
| GET | `/public/tienda_online/carrito/<token>` | `{datos: {token, estado, divisa, neto, total_iva, total, unidades, datos_checkout, lineas[], documento}}`; 404 si no existe |
| GET | `/tienda_online/carrito` (con login) | carrito abierto del usuario en el storeview |

Estados del carrito: `ABIERTO`, `PAGO_PENDIENTE`, `PAGADO`, `CONVERTIDO`, `ERROR_CONVERSION`.

## Specs

### Storeview

<!-- [tienda-storeview-01] [nueva] -->
El código del storeview activo sale de la variable de entorno de la app `VITE_STORE_VIEW`. Si no está definida, la tienda muestra un error de configuración en lugar del catálogo.

<!-- [tienda-storeview-02] [nueva] -->
Al arrancar, la tienda carga el storeview (`GET /public/tienda_online/storeview/<codigo>`) y lo mapea a `StoreView { codigo, nombre, idioma, urlBase, website: { id, codigo, nombre, divisa } }`.

<!-- [tienda-storeview-03] [nueva] -->
Si el storeview no existe (404), la tienda muestra «Tienda no disponible» y no intenta crear carrito.

<!-- [tienda-storeview-04] [nueva] -->
Todas las llamadas REST de la tienda añaden la cabecera `X-Store-View` con el código del storeview activo. Las llamadas de catálogo y ficha añaden además `X-Carrito-Token` cuando hay un token guardado (así el backend aplica el precio del cliente asociado al carrito).

### Almacén del carrito

<!-- [tienda-carrito_store-01] [nueva] -->
El token del carrito se guarda en `localStorage` con una clave por storeview (`tienda_online.carrito.<codigo_storeview>`), de modo que dos tiendas en el mismo navegador no comparten carrito.

<!-- [tienda-carrito_store-02] [nueva] -->
Al arrancar sin token guardado no se crea carrito: el contador es 0. El carrito se crea (`POST /public/tienda_online/carrito`) la primera vez que se añade un artículo, y el token devuelto se guarda.

<!-- [tienda-carrito_store-03] [nueva] -->
Al arrancar con token guardado se carga el carrito (`GET /public/tienda_online/carrito/<token>`) y el contador muestra el número de unidades (`unidades`) del carrito.

<!-- [tienda-carrito_store-04] [nueva] -->
Si el carrito del token guardado no existe (404) o ya no está en un estado modificable (`PAGADO`, `CONVERTIDO` o `ERROR_CONVERSION`), el token se descarta y el contador vuelve a 0. Un carrito en `PAGO_PENDIENTE` se conserva.

<!-- [tienda-carrito_store-05] [nueva] -->
El almacén expone el carrito actual a React mediante `useSyncExternalStore` (hook `useCarritoTienda`), y una función `recargarCarrito()` que vuelve a leerlo del servidor. Cualquier cambio en las líneas (de otros módulos) llama a `recargarCarrito()` y el contador se actualiza sin recargar la página.

<!-- [tienda-carrito_store-06] [nueva] -->
`olvidarCarrito()` borra el token guardado y deja el contador a 0 (se usará tras un pago confirmado).

### Icono del carrito en la cabecera

<!-- [tienda-icono_carrito-01] [nueva] -->
La app inyecta en `Componentes.cabecera_acciones` un componente con el icono `carrito` que enlaza a `/carrito`. A diferencia de `monterelax_area_clientes`, el icono se muestra también sin login.

<!-- [tienda-icono_carrito-02] [nueva] -->
El icono muestra un distintivo con el número de unidades del carrito cuando es mayor que 0, y no lo muestra con 0. Tiene `aria-label` «Carrito, N artículos».

<!-- [tienda-icono_carrito-03] [nueva] -->
Junto al icono aparece «Entrar» (enlace a `/login`) sin sesión, o «Mi cuenta» (enlace a `/mi-cuenta`) con sesión.

### App `tienda_online`

<!-- [tienda-app-01] [nueva] -->
Existe la app `apps/tienda_online` (paquete `@olula/tienda_online`), basada en `apps/jornadas`, con su factory (`TiendaOnline`, `Auth` con `rutas_publicas`, `Componentes` con `cabecera_acciones`), router y `.env` de ejemplo con `VITE_API_URL` y `VITE_STORE_VIEW`. Pasa `type-check` y `lint`.

<!-- [tienda-app-02] [nueva] -->
Las rutas públicas de la app son `/`, `/catalogo`, `/categoria`, `/producto`, `/carrito`, `/checkout` y `/registro`: se navega por ellas sin login. `/mi-cuenta` exige login.

<!-- [tienda-app-03] [nueva] -->
La ruta `/` muestra, de momento, una página de inicio provisional con el nombre del storeview; el catálogo llega en la fase 8.
