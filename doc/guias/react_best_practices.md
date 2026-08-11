# Informe de buenas prácticas React — Quimera Olula

Análisis basado en las reglas de `vercel-react-best-practices` aplicadas a la arquitectura de vistas (referencia: `tpv/venta`) y el patrón de inyección de dependencias (`naranjas_jimenez`).

---

## Resumen priorizado

| # | Recomendación | Regla | Coste | Impacto | Ficheros |
|---|---|---|---|---|---|
| P1 | Hoist `metaTabla` con JSX estático | Hoist Static JSX | Bajo | Medio-Alto | Todos los Maestro |
| P2 | Hoist funciones `titulo` | Hoist Static JSX | Muy bajo | Bajo-Medio | Todos los Detalle |
| P3 | Estado derivado en render, no en efecto | Derived State | Bajo | Medio | Detalle* |
| P4 | Dependencias primitivas en efectos (`useRef`) | Narrow Deps | Bajo | Bajo-Medio | Todos los Maestro |
| P5 | Reemplazar `.sort()` con `.toSorted()` | toSorted | Muy bajo | Medio-Alto | Dominio |
| P6 | Lazy loading en Factory de DI | Conditional Loading | Medio | Alto | `factory.ts` apps |
| P7 | Guard `didInit` en efectos de carga | Init Once | Bajo | Bajo-Medio | Todos los Maestro |

---

## P1 — Hoist de `metaTabla` con JSX estático fuera del componente

**Regla**: Hoist Static JSX Elements
**Impacto**: Medio-Alto | **Coste**: Bajo

### Diagnóstico

En todos los componentes Maestro con columna de estado (`MaestroConDetallePresupuesto`, `MaestroConDetallePedido`, `MaestroConDetalleAlbaran`, y sus equivalentes en TPV), la `metaTabla` se define **dentro del componente**, creando un array nuevo y una función `render` nueva en cada render:

```tsx
// ❌ En MaestroConDetallePedido.tsx — recreado en cada render
export const MaestroConDetallePedido = () => {
  const metaTablaPedido = [
    {
      id: "estado",
      render: (pedido: Pedido) => (
        <ColumnaEstadoTabla
          estados={{                          // ← nuevo objeto cada render
            aprobado: <QIcono ... />,         // ← nuevo JSX cada render
            pendiente: <QIcono ... />,        // ← nuevo JSX cada render
          }}
          estadoActual={pedido.servido == "TOTAL" ? "aprobado" : "pendiente"}
        />
      ),
    },
    ...metaTablaBase,
  ] as MetaTabla<Pedido>;
```

La función `render` no cierra sobre ningún estado del componente, por lo que todo puede vivir en el ámbito de módulo.

### Solución

```tsx
// ✅ Hoisted a módulo — se crean una sola vez
const iconoServido = (
  <QIcono nombre="circulo_relleno" tamaño="sm" color="var(--color-deshabilitado-oscuro)" />
);
const iconoPendiente = (
  <QIcono nombre="circulo_relleno" tamaño="sm" color="var(--color-exito-oscuro)" />
);
const estadosPedido = { aprobado: iconoServido, pendiente: iconoPendiente };

const metaTablaPedido: MetaTabla<Pedido> = [
  {
    id: "estado",
    cabecera: "",
    render: (pedido: Pedido) => (
      <ColumnaEstadoTabla
        estados={estadosPedido}
        estadoActual={pedido.servido == "TOTAL" ? "aprobado" : "pendiente"}
      />
    ),
  },
  ...metaTablaBase,
];

export const MaestroConDetallePedido = () => {
  // metaTablaPedido ya no se recrea
```

**Ficheros afectados**: `MaestroConDetallePresupuesto.tsx`, `MaestroConDetallePedido.tsx`, `MaestroConDetalleAlbaran.tsx`, y sus equivalentes en `tpv/`.

---

## P2 — Hoist de funciones `titulo` en componentes Detalle

**Regla**: Hoist Static JSX Elements
**Impacto**: Bajo-Medio | **Coste**: Muy bajo

### Diagnóstico

En todos los componentes Detalle se define `titulo` dentro del componente siendo una función pura que no captura estado:

```tsx
// ❌ Recreado en cada render en DetallePresupuesto, DetallePedido, DetalleAlbaran, DetalleFactura...
const titulo = (presupuesto: Presupuesto) => presupuesto.codigo;
```

### Solución

```tsx
// ✅ A nivel de módulo
const titulo = (presupuesto: Presupuesto) => presupuesto.codigo;

export const DetallePresupuesto = ({ id, publicar }: ...) => {
  // titulo ya no se recrea
```

**Ficheros afectados**: todos los `Detalle*.tsx` del proyecto.

---

## P3 — Estado derivado computado en render, no en efectos

**Regla**: Calculate Derived State During Rendering
**Impacto**: Medio | **Coste**: Bajo

### Diagnóstico

El patrón de `acciones` en los componentes Detalle recrea el array en cada render aunque sus valores dependan solo de datos ya disponibles:

```tsx
// ❌ Se recrea en cada render aunque depende de datos estables
const acciones = [
  { texto: "Aprobar", deshabilitado: ctx.presupuesto.aprobado, onClick: ... },
  { texto: "Borrar",  deshabilitado: ctx.presupuesto.aprobado, onClick: ... },
];
```

### Solución

```tsx
// ✅ Memoizar con deps específicas
const acciones = useMemo(() => [
  { texto: "Aprobar", deshabilitado: ctx.presupuesto.aprobado, onClick: handleAprobar },
  { texto: "Borrar",  deshabilitado: ctx.presupuesto.aprobado, onClick: handleBorrar },
], [ctx.presupuesto.aprobado, handleAprobar, handleBorrar]);
```

Aplica también al procesador `abiertaOEmitidaContexto` en `tpv/venta`: si el estado (`ABIERTA` / `EMITIDA`) puede derivarse directamente de `venta.abierta` sin necesidad de almacenarlo en la máquina, se eliminan renders intermedios.

---

## P4 — Dependencias primitivas en efectos

**Regla**: Narrow Effect Dependencies
**Impacto**: Bajo-Medio | **Coste**: Bajo

### Diagnóstico

El proyecto usa `// eslint-disable-next-line react-hooks/exhaustive-deps` extensamente para omitir dependencias en efectos. El caso más habitual es la carga inicial en los componentes Maestro:

```tsx
// ❌ criteria es un objeto — captura la referencia en el momento del mount
//    pero el eslint-disable oculta la dependencia real
useEffect(() => {
  emitir("recarga_de_presupuestos_solicitada", ctx.presupuestos.criteria);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

### Solución con `useRef`

```tsx
// ✅ Captura explícita del valor inicial — sin necesidad del disable comment
const criteriaInicialRef = useRef(ctx.presupuestos.criteria);

useEffect(() => {
  emitir("recarga_de_presupuestos_solicitada", criteriaInicialRef.current);
}, []); // Deps vacías pero semánticamente correctas
```

---

## P5 — Reemplazar `.sort()` con `.toSorted()`

**Regla**: Use toSorted() Instead of sort()
**Impacto**: Medio-Alto (previene bugs de mutación) | **Coste**: Muy bajo

### Diagnóstico

`.sort()` muta el array original, lo que rompe el modelo de inmutabilidad de React. En la arquitectura de este proyecto, los procesadores de la máquina de estados deben ser **funciones puras** que devuelvan nuevos objetos. Cualquier `.sort()` sobre `contexto.lista` mutaría el estado.

### Búsqueda

```bash
grep -r "\.sort(" packages/contextos/src --include="*.ts" --include="*.tsx"
```

### Corrección

```typescript
// ❌
contexto.lista.sort((a, b) => ...)

// ✅
contexto.lista.toSorted((a, b) => ...)
```

`.toSorted()` está disponible en todos los navegadores modernos (Chrome 110+, Safari 16+, Firefox 115+, Node.js 20+).

---

## P6 — Carga condicional de módulos en el patrón Factory

**Regla**: Conditional Module Loading
**Impacto**: Alto (bundle size) | **Coste**: Medio

### Diagnóstico

El patrón de inyección de dependencias en `naranjas_jimenez` usa imports **estáticos** que se resuelven en tiempo de compilación. Todos los módulos de todas las secciones se cargan al arrancar la app, aunque el usuario solo acceda a algunas de ellas:

```typescript
// apps/naranjas_jimenez/src/factory.ts — todos los módulos cargan al arrancar ❌
import { CrearLineaNrj } from "./contextos/ventas/pedido/crear_linea/CrearLinea.tsx";
import { LineasListaNrj } from "./contextos/ventas/pedido/detalle/Lineas/LineasLista.tsx";
import { ventasPedidoInfra } from "./contextos/ventas/pedido/infraestructura.ts";

export class FactoryVentasNrj {
    static pedido_detalle_lineas_LineasLista = LineasListaNrj;
    static pedido_CrearLinea = CrearLineaNrj;
    static pedido_infraestructura = ventasPedidoInfra;
}
```

### Solución con lazy imports

```typescript
// ✅ Carga solo cuando se necesita el módulo
export class FactoryVentasNrj {
    static pedido_detalle_lineas_LineasLista = lazy(() =>
        import("./contextos/ventas/pedido/detalle/Lineas/LineasLista.tsx")
            .then(m => ({ default: m.LineasListaNrj }))
    );
    static pedido_CrearLinea = lazy(() =>
        import("./contextos/ventas/pedido/crear_linea/CrearLinea.tsx")
            .then(m => ({ default: m.CrearLineaNrj }))
    );
}
```

Esto requiere que los componentes inyectados se consuman con `<Suspense fallback={...}>`, lo que encaja con el patrón de renderizado condicional por estado de máquina ya existente.

---

## P7 — Guard `didInit` para efectos de carga en Strict Mode

**Regla**: Initialize App Once, Not Per Mount
**Impacto**: Bajo-Medio | **Coste**: Bajo

### Diagnóstico

En React Strict Mode (activado en desarrollo), los efectos se ejecutan **dos veces** al montar. Todos los componentes Maestro harían 2 peticiones HTTP al arrancar en desarrollo:

```tsx
// ❌ En Strict Mode ejecuta 2 veces → 2 peticiones GET en desarrollo
useEffect(() => {
  emitir("recarga_de_presupuestos_solicitada", ctx.presupuestos.criteria);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

### Solución

```tsx
// ✅ Se ejecuta exactamente una vez por instancia del módulo
let didInit = false;

export const MaestroConDetallePresupuesto = () => {
  // ...
  useEffect(() => {
    if (didInit) return;
    didInit = true;
    emitir("recarga_de_presupuestos_solicitada", criteriaInicialRef.current);
  }, []);
```

> Nota: En una SPA de ERP sin SSR donde Strict Mode puede estar desactivado en producción, el impacto real es únicamente en entorno de desarrollo.
