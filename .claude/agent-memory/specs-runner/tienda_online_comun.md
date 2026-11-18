# Memoria técnica — tienda_online / comun (y auth/rutas_publicas)

## Comandos de tests

```bash
pnpm run --filter @olula/ctx test -- src/tienda_online/ --run
pnpm run --filter @olula/ctx test -- src/auth/ --run
pnpm run --filter @olula/tienda_online type-check
pnpm run --filter @olula/olula type-check   # el cambio del middleware afecta a todas las apps
```

## Ficheros clave (a crear o tocar)

| Fichero | Contenido |
|---|---|
| `packages/contextos/src/auth/middlewares.ts` | `authMiddleware`. Hoy `rutasPublicas` es una lista fija comparada con `includes`. Añadir las de `FactoryObj.app.Auth?.rutas_publicas` por prefijo de segmento. Extraer una función pura `esRutaPublica(pathname, extra)` para testearla. |
| `packages/contextos/lib/src/factory_ctx.tsx` | `FactoryObj.app`: la factory de la app activa, accesible fuera de React (ver `ventas/pedido/infraestructura.ts`). |
| `packages/contextos/src/tienda_online/comun/urls.ts` | `TiendaOnline_Urls`: `STOREVIEW`, `CARRITO` (`/public/tienda_online/...`), `CARRITO_USUARIO` (`/tienda_online/carrito`). |
| `packages/contextos/src/tienda_online/comun/diseño.ts` | `StoreView`, `CarritoTienda`, `LineaCarritoTienda`, `EstadoCarrito`. |
| `packages/contextos/src/tienda_online/comun/infraestructura.ts` | `getStoreView`, `postCarrito`, `getCarrito` y mappers `xxxDesdeApi`. Cabecera `X-Store-View` (y `X-Carrito-Token` en catálogo y ficha). Comprobar si `RestAPI` admite cabeceras extra; si no, añadirlo sin romper la firma actual. |
| `packages/contextos/src/tienda_online/comun/carrito_store.ts` | Almacén con `useSyncExternalStore`, como `packages/contextos/lib/src/carritoLineas.ts`. Clave de `localStorage` por storeview. |
| `packages/contextos/src/tienda_online/comun/componentes/` | `IconoCarrito` / `AccionesCabeceraTienda`. Referencia: `apps/monterelax_area_clientes/src/componentes/AccionesCabeceraMonterelax.tsx` (pero visible sin login). |
| `packages/componentes/src/plantilla/Cabecera.tsx:177` | Slot `cabecera_acciones`; no hace falta tocarlo. |
| `apps/tienda_online/` | Copia de `apps/jornadas` (package.json, vite, tsconfig, index.html, eslint, main.tsx con `authMiddleware`). |

## Patrones específicos

- Los tests van en `packages/contextos/src/tienda_online/comun/test/`. Lógica pura (mappers, `esRutaPublica`, reglas de descarte del token) separada de los efectos para poder testearla sin red; las llamadas REST se mockean.
- El backend devuelve importes como `float` y los ids de línea como `int`.
- Estados en los que se descarta el token: `PAGADO`, `CONVERTIDO`, `ERROR_CONVERSION`.

## Mapeo de specs a tests

| ID spec | Fichero de test | Función/describe |
|---|---|---|
