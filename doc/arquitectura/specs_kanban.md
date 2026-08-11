# Pompt
Quiero crear una modo de vista Kanban para algunas vistas con estados.

El control Kanban puede sustituir / ser una opción de @packages/componentes/src/maestro/Listado.tsx. Recibirá:
	+ El criteria?
	+ El componente tarjeta para dibujar cada tarjeta
	+ El atributo de las entidades que indica el estado / columna del Kaban
	+ El array de posibles estados ordenados como deben mostrarse en el kanban
	+ Las entidades a mostrar
	+ La función callback para llamar cuando una tarjeta cambia de columna
	
El Kanban debe permitir arrastrar tarjetas entre columnas, llamando al callback de cambio de columna

Problemática: Si permitimos ordenar tarjetas dentro de la misma columna, ver cómo almacenamos esta ordenación ¿bd, navegador? Teniendo en cuenta que en función de filtros, permisos, etc aparecerán unas tarjetas u otras.

Propón un plan y lo documentaremos en doc/arquitectura/specs_kanban.md si lo aprobamos

# Spec: Modo Kanban en Listado

## Objetivo

Añadir un tercer modo de visualización "kanban" al componente `Listado`, que agrupe entidades por estado en columnas y permita arrastrar tarjetas entre columnas para cambiar su estado.

Los modos actuales son `"tabla"` y `"tarjetas"`. El kanban se incorpora como un modo adicional opt-in: si el padre no pasa las props necesarias, el modo no está disponible y nada cambia.

---

## Librería drag-and-drop: `@dnd-kit`

**Selección: `@dnd-kit/core` + `@dnd-kit/sortable`**

| Criterio | @dnd-kit | react-beautiful-dnd | HTML5 nativo |
|---|---|---|---|
| Mantenimiento | Activo | **Deprecated** | N/A |
| Soporte React 19 | Sí | No | Sí |
| Touch / mobile | Sí | Limitado | No |
| Accesibilidad ARIA | Nativo | Sí | Manual |
| Tamaño bundle | ~15kb (modular) | ~30kb | 0kb |

`react-beautiful-dnd` está deprecado y no soporta React 19. `@dnd-kit` es el estándar actual.

Se instala en `packages/componentes/package.json` (no en la raíz del monorepo):

```
pnpm add --filter @olula/componentes @dnd-kit/core @dnd-kit/sortable
```

---

## Decisión: ordenación dentro de columnas

### V1 (implementación inicial): Sin ordenación dentro de columnas

Las tarjetas dentro de cada columna siguen el `criteria.orden` que viene del servidor. El drag-and-drop solo permite mover tarjetas **entre** columnas (cambiando su estado). No hay DnD dentro de la misma columna.

**Justificación**: el valor principal del kanban es agrupar y mover entre estados. Implementar ordenación dentro de columnas requiere persistencia con tradeoffs significativos:

- **localStorage**: por-dispositivo, se pierde si el usuario limpia el storage; el hash de criteria puede desincronizarse al cambiar filtros
- **Backend con campo `posicion`**: requiere cambios de schema, migración de datos y endpoint PATCH — alcance fuera del frontend
- **Estado local React**: solo dura la sesión, se pierde al navegar

La ordenación por criteria del servidor es predecible y consistente entre dispositivos y sesiones.

### V2 (futuro): localStorage con hash de criteria como clave

```
clave:  kanban-orden-{moduloId}-{hash(JSON.stringify(criteria.filtro) + JSON.stringify(criteria.orden))}
valor:  Record<columnaId, string[]>   // { "Pendiente": ["id1", "id2"], ... }
```

Las tarjetas que no aparezcan en la lista almacenada se añaden al final. Si el criteria cambia, el hash cambia y se parte de orden limpio (sin entradas huérfanas).

### V3 (largo plazo): Campo `posicion` en el backend

Requiere coordinación con el equipo backend. El endpoint quedaría:
```
PATCH /api/entidad/{id}   { estado: "Pendiente", posicion: 2 }
```
El `diseño.ts` de cada módulo añadiría el campo `posicion?: number` a la entidad.

---

## Interface del componente `QKanban`

**Archivo:** `packages/componentes/src/atomos/qkanban.tsx`

```typescript
import { Entidad } from "@olula/lib/diseño.ts";

export type QKanbanColumna = {
  id: string;        // valor del campo estado que identifica la columna
  etiqueta: string;  // texto a mostrar en el header de la columna
  color?: string;    // color CSS opcional para el header (ej. "var(--color-exito)")
};

export type QKanbanProps<T extends Entidad> = {
  // Datos
  entidades: T[];
  cargando?: boolean;

  // Columnas
  columnas: QKanbanColumna[];
  campoEstado: keyof T;   // campo de T cuyo valor determina la columna

  // Render de cada tarjeta (misma firma que en QTarjetas)
  tarjeta: (entidad: T) => React.ReactNode;

  // Selección
  seleccionadaId?: string;
  onSeleccion?: (entidad: T) => void;

  // Cambio de estado vía DnD
  onCambioEstado: (id: string, nuevoEstado: string) => void;
};
```

`columnas: QKanbanColumna[]` en lugar de `string[]` permite pasar `etiqueta` y `color` por columna sin romper la API cuando se necesiten en el futuro. El llamador que no los necesite usa:
```typescript
columnas: estados.map(e => ({ id: e, etiqueta: e }))
```

---

## Integración con `Listado`

### Nuevas props en `ListadoProps<T>`

```typescript
// Todas opcionales. Si no se pasan, el modo kanban no aparece en el Listado.
columnasKanban?: QKanbanColumna[];
campoEstadoKanban?: keyof T;
onCambioEstadoKanban?: (id: string, nuevoEstado: string) => void;
```

### Cambios en `Listado.tsx`

1. `type Modo = "tabla" | "tarjetas" | "kanban"`
2. `const puedeKanban = columnasKanban !== undefined && campoEstadoKanban !== undefined && onCambioEstadoKanban !== undefined`
3. `modoEfectivo` evalúa "kanban" antes que los demás modos si es el solicitado y `puedeKanban`
4. El icono de cambio de modo cicla entre los modos disponibles (actualmente es toggle binario)
5. `renderKanban()` instancia `<QKanban>` con las props correspondientes

### Ciclo entre modos (3 modos posibles)

El toggle actual es binario (tabla ↔ tarjetas). Con 3 modos, se cicla entre los disponibles:

```typescript
const modosDisponibles: Modo[] = [
  ...(puedeKanban   ? ["kanban"   as Modo] : []),
  ...(puedeTarjetas ? ["tarjetas" as Modo] : []),
  ...(puedeTabla    ? ["tabla"    as Modo] : []),
];

const siguienteModo = (): Modo => {
  const idx = modosDisponibles.indexOf(modoEfectivo as Modo);
  return modosDisponibles[(idx + 1) % modosDisponibles.length];
};
```

El icono muestra el modo al que se cambiará (igual que el comportamiento actual tabla/tarjetas).

---

## Icono kanban en `qicono.tsx`

```typescript
import { IconLayoutKanban } from "@tabler/icons-react";

// Añadir al mapa de iconos:
kanban: IconLayoutKanban,
```

---

## Estructura interna de `QKanban`

```
DndContext (onDragEnd → onCambioEstado)
  └── div.QKanban  (flex-row, scroll horizontal)
       ├── KanbanColumna  (useDroppable, id = columna.id)
       │    ├── div.kanban-columna-header  (etiqueta + contador)
       │    └── div.kanban-columna-cuerpo  (scroll vertical)
       │         ├── KanbanTarjeta  (useDraggable, id = entidad.id)
       │         │    └── tarjeta(entidad)
       │         └── ...
       ├── KanbanColumna
       └── ...
```

`onDragEnd({ active, over })`: si `over` existe y es una columna distinta a la actual, llama `onCambioEstado(active.id as string, over.id as string)`.

Las tarjetas dentro de una columna son `useDraggable` pero no `useSortable` (V1 sin orden interno). En V2 se sustituye por `useSortable` de `@dnd-kit/sortable`.

---

## Ejemplo de uso desde un maestro

```typescript
// CRM: Acciones (campo estado es string simple)
const COLUMNAS_ACCIONES: QKanbanColumna[] = [
  { id: "Borrador",  etiqueta: "Borrador" },
  { id: "Pendiente", etiqueta: "Pendiente", color: "var(--color-advertencia)" },
  { id: "Hecha",     etiqueta: "Hecha",     color: "var(--color-exito)" },
];

<Listado<Accion>
  {/* ...props existentes sin cambios... */}
  columnasKanban={COLUMNAS_ACCIONES}
  campoEstadoKanban="estado"
  onCambioEstadoKanban={(id, nuevoEstado) =>
    emitir("cambio_estado_accion_solicitado", { id, nuevoEstado })
  }
/>
```

```typescript
// CRM: Oportunidades (campo estado es una FK con id numérico)
const COLUMNAS_OPORTUNIDAD: QKanbanColumna[] = [
  { id: "1", etiqueta: "Pendiente",     color: "var(--color-advertencia)" },
  { id: "2", etiqueta: "En negociación" },
  { id: "3", etiqueta: "Ganada",        color: "var(--color-exito)" },
  { id: "4", etiqueta: "Perdida",       color: "var(--color-error)" },
];

<Listado<OportunidadVenta>
  {/* ...props existentes... */}
  columnasKanban={COLUMNAS_OPORTUNIDAD}
  campoEstadoKanban="estado_id"
  onCambioEstadoKanban={(id, nuevoEstado) =>
    emitir("cambio_estado_oportunidad_solicitado", { id, nuevoEstado })
  }
/>
```

El evento en la máquina hace un PATCH al backend y recarga la lista.

---

## Consideraciones

**Paginación**: El kanban muestra todas las `entidades` recibidas sin paginación interna. Funciona mejor cuando hay filtros activos que limitan el total (<100 entidades). Si se necesita escalar, V2 puede cargar por columna con fetches independientes por estado.

**Accesibilidad**: `@dnd-kit` provee atributos ARIA automáticamente al aplicar `{...attributes}` del `useDraggable` al elemento raíz de cada tarjeta. Esto permite activar el DnD desde teclado sin cambios adicionales.

**`ListadoSemiControlado`**: Si se necesita kanban en él, los mismos cambios aplican. Al trabajar con datos locales, el kanban funciona bien (tiene todas las entidades en memoria).

**Tarjeta por defecto**: Si el llamador no pasa `tarjeta` pero sí `metaTabla`, el kanban usará `QTarjetaMetatabla` como fallback (igual que hace el modo tarjetas).

---

## Archivos a crear / modificar

| Archivo | Acción |
|---|---|
| `packages/componentes/src/atomos/qkanban.tsx` | Crear — componente `QKanban` con DnD |
| `packages/componentes/src/atomos/qkanban.css` | Crear — estilos del kanban |
| `packages/componentes/src/maestro/Listado.tsx` | Modificar — añadir modo kanban |
| `packages/componentes/src/atomos/qicono.tsx` | Modificar — añadir icono `kanban` |
| `packages/componentes/src/index.ts` | Modificar — exportar `QKanban` |
| `packages/componentes/package.json` | Modificar — añadir `@dnd-kit/core` y `@dnd-kit/sortable` |

---

## Verificación

1. `pnpm run --filter @olula/componentes type-check` — sin errores TypeScript
2. `pnpm lint` — sin errores ESLint
3. En dev server (`/docs/componentes`) verificar el `QKanban` visualmente
4. Drag entre columnas llama a `onCambioEstado` con los parámetros correctos
5. Sin `columnasKanban`/`campoEstadoKanban`, el icono kanban no aparece en el `Listado`
