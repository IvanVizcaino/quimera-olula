# Extensión: módulo con sub-recursos (líneas)

Esta carpeta contiene el **delta** necesario para convertir un módulo simple en un módulo con sub-recursos (líneas).

## Cómo usar

Parte de `_plantilla/modulo/` (cópialo completo con tu nombre de entidad) y luego:

### 1. REEMPLAZA estos ficheros con los de esta carpeta

| Fichero a reemplazar | Qué añade esta versión |
|---|---|
| `diseño.ts` | Segunda entidad `LineaXxx` + `ItemModLin` (entidad ligera para maestro) + tipos de función de infraestructura |
| `infraestructura.ts` | `getModLin` devuelve el módulo con líneas embebidas; `getModLins` devuelve `ItemModLin` (sin líneas); CRUD de líneas: `postLineaXxx`, `patchLineaXxx`, `deleteLineaXxx` |
| `maestro/diseño.ts` | Igual que la base (INICIAL + CREANDO); adapta nombres de entidad |
| `maestro/maquina.ts` | Igual que la base; adapta nombres de entidad |
| `maestro/maestro.ts` | Usa `ItemModLin` para la lista; incluye `incluirModLinCreadoPorId` |
| `crear/crear.ts` | Metadata y valor inicial para la entidad simplificada (sin los campos extra) |
| `crear/CrearModulo.tsx` | Modal de alta adaptado a los campos de `ModLin` |
| `detalle/diseño.ts` | Añade 3 estados extra + campo `lineas` al contexto |
| `detalle/maquina.ts` | +3 estados: `CREANDO_LINEA`, `CAMBIANDO_LINEA`, `BORRANDO_LINEA` |
| `detalle/detalle.ts` | `refrescarModLin` sincroniza líneas; +`onLineaCreada/Cambiada/Borrada`; `cargarContexto` en una sola llamada API |
| `detalle/DetalleModulo.tsx` | Añade `<LineasXxx>` como orquestador de líneas |

### 2. AÑADE estas carpetas completas (sin equivalente en la base)

- `dominio.ts` — metadata de `LineaXxx` (`metaLineaXxx`, `metaNuevaLineaXxx`, `nuevaLineaXxxVacia`)
- `detalle/lineas/` — orquestador `LineasXxx.tsx` + tabla `LineasLista.tsx`
- `crear_linea/` — modal de alta de línea
- `cambiar_linea/` — modal de edición de línea
- `borrar_linea/` — modal de borrado de línea

## Qué NO cambia respecto a la base

- `maestro/maquina.ts` — el estado `CREANDO` se mantiene igual que en el módulo simple
- `maestro/MaestroConDetalleModulo.tsx` — idéntico a la base, no se reemplaza
- `borrar/BorrarModulo.tsx` — idéntico a la base, no se reemplaza
- `detalle/TabGeneral.tsx`, `TabInformacion.tsx` — idénticos, no se reemplazan

## Convenciones de nombrado

En todos los ficheros, sustituye los nombres de plantilla por los de tu dominio:

| Plantilla | Tu dominio |
|---|---|
| `ModLin` | Ej. `Pedido`, `Presupuesto` |
| `ItemModLin` | Ej. `ItemPedido`, `ItemPresupuesto` |
| `LineaModulo` | Ej. `LineaPedido`, `LineaPresupuesto` |
| `modLin` | Ej. `pedido`, `presupuesto` |
| `lineas` | Ej. `lineasPedido` |

## Diseño de la API: líneas embebidas vs endpoint separado

Esta plantilla asume que **`getModLin` devuelve el módulo con sus líneas embebidas** (`ModLin.lineas: LineaXxx[]`). Esto permite sincronizar cabecera y líneas en una sola llamada tras cada operación.

Si la API tiene un endpoint separado (`GET /modulos/{id}/lineas`), añade:
- `GetLineasXxx` en `diseño.ts`
- `getLineasXxx` en `infraestructura.ts`
- `refrescarLineas` en `detalle/detalle.ts` (llamada separada tras `refrescarModLin`)
- Los handlers `onLineaCreada/Cambiada/Borrada` pasan de 2 pasos a 3 (añadir `refrescarLineas`)

## Entidad ligera para el maestro (`ItemModLin`)

El listado del maestro usa `ItemModLin` en vez de `ModLin` completo. Esto evita cargar las líneas embebidas en el endpoint de listado (`GET /modulos`), que solo necesita campos de cabecera.

- `diseño.ts` define `ItemModLin extends Entidad` con los campos que devuelve el listado
- `infraestructura.ts` define `ItemModLinApi`, `itemModLinDesdeApi` y `getModLins` usando estos tipos
- `maestro/maquina.ts` usa `ListaActivaEntidades<ItemModLin>` en el contexto
- `incluirModLinCreadoPorId` obtiene la entidad completa vía `getModLin` y la incluye en la lista (compatible por tipado estructural)

Referencia canónica de implementación real: `packages/contextos/src/tpv/venta/` y `packages/contextos/src/almacen/orden/`
