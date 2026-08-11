# Sistema de filtros — MetaFiltro

El sistema de filtros de Quimera Ólula está construido alrededor del tipo `MetaFiltro`, que describe cómo cada campo del listado se muestra en la UI de filtros y cómo se convierte en la cláusula de filtrado que viaja a la API.

---

## Conceptos clave

```
MetaFiltro
  └── MetaCampoFiltro (por campo)
        ├── id          → clave en el formulario de filtros
        ├── campo       → nombre del campo en la API (si difiere de id)
        ├── label       → etiqueta en la UI
        ├── tipo        → qué componente de input renderizar
        ├── filtro()    → convierte valor del formulario → ClausulaFiltro
        ├── fromFiltro()→ [opcional] convierte ClausulaFiltro → valor del formulario
        └── render()    → [opcional] componente UI personalizado
```

Una `ClausulaFiltro` es una tupla `[campo_api, operador, valor]` que el backend interpreta. Varias cláusulas forman un `Filtro`, que junto a orden y paginación constituye el `Criteria`.

---

## Tipos de filtro disponibles

| `tipo`              | Componente renderizado | Operadores generados |
|---------------------|------------------------|----------------------|
| `"texto"` (defecto) | `QInput` (texto libre) | `~` (contiene)       |
| `"checkbox"`        | `QCheckbox`            | `=`                  |
| `"intervalo_fechas"`| `QDateInterval`        | `>=`, `<=`, `<>`     |
| `"intervalo_numeros"`| `QNumberInterval`     | `>=`, `<=`, `<>`     |
| `"multiseleccion"`  | `QMultiCheckbox`       | —                    |
| `"mes_año"`         | `QMonthYear`           | `<>` (rango mensual) |
| *(ninguno / render)*| componente propio      | libre                |

---

## Funciones constructoras de cláusulas

```typescript
import {
  filtroTextos,    // [campo, "~",  valor]
  filtroBooleanos, // [campo, "=",  valor]
  filtroFechas,    // [campo, op,   "YYYY-MM-DD_YYYY-MM-DD"]
  filtroNumeros,   // [campo, op,   "n1_n2"]
  filtroMesAnyo,   // [campo, "<>", "YYYY-MM-01_YYYY-MM-NN"]
} from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
```

Todas retornan `ClausulaFiltro | null`. Devuelven `null` cuando el valor está vacío; `buildFiltros` descarta los nulls y no genera cláusula alguna.

---

## Uso básico: `getMetaFiltroDefecto`

Para la mayoría de campos basta con generar el `MetaFiltro` automáticamente a partir de la `MetaTabla`. El tipo de columna determina el tipo de filtro:

| Tipo de columna      | Tipo de filtro generado |
|----------------------|-------------------------|
| `"fecha"`, `"fechahora"`, `"hora"` | `"intervalo_fechas"` |
| `"numero"`, `"moneda"` | `"intervalo_numeros"` |
| `"booleano"`         | `"checkbox"`            |
| cualquier otro       | `"texto"`               |

```tsx
// Sin metaFiltro explícito → se usa getMetaFiltroDefecto(metaTabla) internamente
<Listado metaTabla={metaTablaCliente} ... />

// Equivalente explícito
import { getMetaFiltroDefecto } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";

<Listado
  metaTabla={metaTablaCliente}
  metaFiltro={getMetaFiltroDefecto(metaTablaCliente)}
  ...
/>
```

---

## Personalización del MetaFiltro

El patrón habitual es extender el defecto y sobrescribir o añadir los campos que necesiten tratamiento especial:

```typescript
const metaFiltro: MetaFiltro = {
  ...getMetaFiltroDefecto(metaTabla),
  // campos añadidos o sobrescritos aquí
};
```

---

## Ejemplos por caso de uso

### 1. Campo de texto con filtro de igualdad exacta (no contiene)

```typescript
estado: {
  id: "estado",
  label: "Estado",
  filtro: (v) => (v ? ["estado", "=", v as string] : null),
},
```

### 2. Campo con id de dominio distinto al campo de la API

Usar `campo` para declarar el nombre del campo en la API. La hidratación desde URL funciona automáticamente sin necesidad de `fromFiltro`.

```typescript
empleadoId: {
  id: "empleadoId",
  campo: "empleado_id",   // nombre del campo en la cláusula que envía la API
  label: "Empleado",
  filtro: (v) => (v ? ["empleado_id", "=", v as string] : null),
},
```

Regla de uso del campo `campo`:

| Situación | Solución |
|---|---|
| `id` == campo API | no declarar `campo` |
| `id` ≠ campo API (renombrado) | declarar `campo` |
| Inversa no trivial (rango → valor único) | declarar `fromFiltro` |

### 3. Campo con selector de valores (render personalizado)

Cuando el campo tiene valores acotados (enums), sustituir el input de texto por un select propio:

```typescript
tipo: {
  id: "tipo",
  label: "Tipo",
  filtro: (v) => (v ? ["tipo", "=", v as string] : null),
  render: (valor, onChange) => (
    <TipoAccion
      valor={(valor as string) ?? ""}
      onChange={(opcion) => onChange(opcion?.valor ?? "")}
    />
  ),
},
```

El `render` recibe el valor actual y una función `onChange`. La firma de `onChange` es `(v: unknown) => void`.

### 4. Filtro de mes/año

Para listados con vista mensual (registros de jornada, nóminas, etc.). Genera automáticamente el rango completo `[día 1, último día]` del mes seleccionado.

```typescript
import { filtroMesAnyo } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.js";
import { TipoInput } from "@olula/lib/diseño.ts";

fecha: {
  id: "fecha",
  label: "Mes",
  tipo: "mes_año" as TipoInput,
  filtro: (v) => filtroMesAnyo("fecha", v),
  // fromFiltro necesario porque la inversa no es trivial:
  // el backend devuelve el rango completo, no "YYYY-MM"
  fromFiltro: (filtro) => {
    const clausula = filtro.find(([campo]) => campo === "fecha");
    if (!clausula || clausula[1] !== "<>" || !clausula[2]) return undefined;
    const [desde] = clausula[2].split("_");
    return desde.slice(0, 7); // "YYYY-MM"
  },
},
```

El input que se muestra es `<input type="month">`. La cláusula generada para abril 2026 es:
```
["fecha", "<>", "2026-04-01_2026-04-30"]
```

### 5. Filtro de intervalo de fechas con atajos predefinidos

El tipo `"intervalo_fechas"` (generado automáticamente para columnas de tipo `"fecha"`) muestra `QDateInterval`, que incluye un selector de atajos temporales:

- **Días:** Hoy, Ayer, Mañana
- **Semanas:** Esta semana, Semana anterior, Semana siguiente
- **Meses:** Este mes, Mes anterior, Mes siguiente
- **Años:** Este año, Año anterior, Año siguiente

También permite introducir un intervalo manual con dos datepickers (botón "Manual").

```typescript
// Se genera automáticamente si la columna tiene tipo "fecha":
fechaEntrada: {
  id: "fechaEntrada",
  label: "Fecha de entrada",
  tipo: "intervalo_fechas",
  filtro: (valor) => filtroFechas("fechaEntrada", valor),
},
```

### 6. Eliminar un filtro generado automáticamente

Si `getMetaFiltroDefecto` genera un filtro que no quieres mostrar, sobrescríbelo con `undefined`:

```typescript
const metaFiltro: MetaFiltro = {
  ...getMetaFiltroDefecto(metaTabla),
  columnaQueNoQuieroFiltrar: undefined!,
};
```

### 7. `fromFiltro`: hidratación de casos complejos

`fromFiltro` recibe el `Filtro` completo (array de cláusulas activas) y debe devolver el valor que aparecerá en el formulario al hidratar desde URL. Solo es necesario cuando la función `filtro` genera una cláusula con un campo o formato diferente al que `filtroToValores` puede reconstruir automáticamente.

```typescript
// Caso: un único campo de formulario genera dos cláusulas de API
rangoPrecio: {
  id: "rangoPrecio",
  label: "Precio",
  filtro: (v) => {
    const [min, max] = v as [number, number];
    // genera cláusula de rango
    return filtroNumeros("precio", [min, max]);
  },
  fromFiltro: (filtro) => {
    const clausula = filtro.find(([campo]) => campo === "precio");
    if (!clausula || !clausula[2]) return undefined;
    const [min, max] = clausula[2].split("_").map(Number);
    return [min, max];
  },
},
```

---

## Referencia rápida: estructura de `MetaCampoFiltro`

```typescript
type MetaCampoFiltro = {
  /** Clave en el formulario de filtros (camelCase, nombre de dominio). */
  id: string;

  /** Nombre del campo en la API (snake_case). Declarar solo si difiere de `id`.
   *  Permite la hidratación automática desde URL sin necesidad de `fromFiltro`. */
  campo?: string;

  /** Etiqueta visible en la UI de filtros. */
  label: string;

  /** Determina qué componente de input se renderiza.
   *  Si no se especifica, se usa un QInput de texto. */
  tipo?: TipoInput;

  /** Opciones para el tipo "multiseleccion". */
  opciones?: Opcion[];

  /** Valor cuando el filtro se limpia individualmente (botón X).
   *  Si no se especifica, limpiar elimina la cláusula por completo. */
  valorDefecto?: unknown;

  /** Convierte el valor del formulario en una ClausulaFiltro.
   *  Devolver null omite el campo del filtro activo. */
  filtro: (v: unknown) => ClausulaFiltro | null;

  /** Convierte el Filtro activo de vuelta al valor del formulario.
   *  Solo necesario para inversas no triviales. Para renombrados simples,
   *  basta con declarar `campo`. */
  fromFiltro?: (filtro: Filtro) => unknown;

  /** Componente de input completamente personalizado.
   *  Recibe el valor actual y un onChange. Tiene prioridad sobre `tipo`. */
  render?: (valor: unknown, onChange: (v: unknown) => void) => ReactNode;
};
```
