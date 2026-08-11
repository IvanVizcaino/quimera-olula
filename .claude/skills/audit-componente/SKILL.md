---
name: audit-componente
description: |
  Audita componentes UI reutilizables de packages/componentes/src/ en tres dimensiones:
  consistencia estructural y de nomenclatura, UI/UX y accesibilidad, y calidad de código general.
  Detecta la categoría del componente (átomo, molécula, o feature/dominio complejo) y aplica
  las verificaciones correspondientes.
  Produce un informe con desviaciones y recomienda: alinear el componente, actualizar la
  convención, o aceptar como extensión de dominio.

  <example>
  user: "/audit-componente packages/componentes/src/arbol_documentos packages/componentes/src/gestor_documentos packages/componentes/src/lista_documentos"
  assistant: Determina que los tres son componentes de feature/dominio complejos, lee sus ficheros, ejecuta las tres dimensiones de verificación y genera un informe consolidado por componente y agregado.
  </example>

  <example>
  user: "audita el átomo qselect"
  assistant: Detecta que es un átomo (packages/componentes/src/atomos/qselect.tsx), aplica las verificaciones de átomos/moléculas y genera el informe.
  </example>
---

# Audit Componente — Quimera Olula

Auditas componentes UI reutilizables de `packages/componentes/src/` en tres dimensiones:
consistencia estructural y de nomenclatura, UI/UX y accesibilidad, y calidad de código general.
Acepta una o más rutas como argumento; cada una se audita de forma independiente y el informe
final las consolida.

No existe un `README.md`/`STYLEGUIDE.md` en `packages/componentes/`: las convenciones son
implícitas en el código ya existente. Este skill trata los componentes de referencia (los átomos
y módulos citados abajo) como la "plantilla viva" contra la que se compara, igual que
`audit-modulo` compara contra `_plantilla/modulo/`.

## Paso 0 — Determinar categoría de cada componente objetivo

Para cada ruta recibida:

1. Si cae bajo `packages/componentes/src/atomos/` → categoría **átomo**.
2. Si cae bajo `packages/componentes/src/moleculas/` → categoría **molécula**.
3. En cualquier otro caso (carpeta propia por feature/dominio, ej. `arbol_documentos/`,
   `gestor_documentos/`, `lista_documentos/`, `calendario/`, `menu/`, `detalle/`, `maestro/`,
   `vista/`, `slot/`) → categoría **feature/dominio complejo**. Confírmalo mirando si la carpeta
   tiene `diseño.ts`/`dominio.ts`/`maquina.ts` (patrón DDD completo) o solo uno o pocos `.tsx`/
   `.css` (componente de presentación agrupado por dominio, sin máquina propia — aplica solo la
   parte de 3.2 que sea pertinente).
4. Si la ruta es una carpeta con varios ficheros dentro, audita el componente principal (el que
   da nombre a la carpeta, p.ej. `QGestorDocumentos.tsx`) junto con sus subcomponentes internos
   como una sola unidad.
5. No mezcles las tablas de átomo/molécula (3.1) con las de feature/dominio complejo (3.2) para
   un mismo componente — la categoría determina cuál aplicar.

## Paso 1 — Cargar referencias

No hay una plantilla física única; la referencia es el conjunto de componentes ya correctos del
mismo tipo.

**Si hay algún átomo o molécula entre los objetivos, lee:**
- `packages/componentes/src/atomos/qboton.tsx` + `qboton.css` + `qboton.historias.ts`
- `packages/componentes/src/atomos/qinput.tsx` + `qinput.historias.ts`
- `packages/componentes/src/historias/listado-historias.ts` (registro del catálogo)
- `packages/componentes/src/tema/tema.css` y `packages/componentes/src/tema/tokens/`

**Si hay algún componente de feature/dominio complejo entre los objetivos, lee:**
- `packages/contextos/src/_plantilla/modulo/diseño.ts` (patrón `Estado`/`Contexto` de
  `@olula/lib/diseño.ts`)
- Los componentes hermanos en la misma carpeta padre si existen (p.ej. si se audita
  `arbol_documentos/`, compáralo con `gestor_documentos/`/`lista_documentos/` y viceversa) —
  sirven de referencia cruzada de consistencia entre hermanos
- Los módulos de `@olula/lib` que el componente consuma, para comprobar si ya existen helpers
  reutilizables antes de señalar duplicación

**Para la dimensión UI/UX y accesibilidad (siempre), lee:**
- `.claude/agents/designer.md` — hereda su clasificación de hallazgos (Crítico/Advertencia/
  Sugerencia) y su conocimiento de selectores CSS de `QModal` (custom elements, atributo
  `nombre`, no `className`)
- Invoca el tool `Skill` con `skill: web-design-guidelines` para traer al contexto las
  directrices (Vercel Web Interface Guidelines) actualizadas

Todo esto lo aplicas tú directamente en este mismo hilo — no delegues la auditoría en el agente
`designer` ni en ningún subagente; solo reutilizas su contenido como referencia, igual que
`audit-modulo` reutiliza la plantilla de `_plantilla/modulo/` sin subagentes.

## Paso 2 — Leer los componentes objetivo

Para cada ruta objetivo, lee:
- Todos los ficheros `.tsx`/`.ts` del componente, incluidos subcomponentes internos
- El `.css` homónimo
- `diseño.ts`, `dominio.ts`, `maquina.ts`, `index.ts` si existen
- El fichero `*.historias.ts` si existe
- Los tipos de otros paquetes que consuma o exponga (`@olula/lib`, `@olula/contextos`), para
  comprobar consistencia de tipos/naming en los límites del componente

## Paso 3 — Verificaciones

### 3.1 Consistencia estructural y de nomenclatura — Átomos y Moléculas

Aplica esta tabla solo a componentes de categoría átomo o molécula.

| Verificación | Cómo comprobar |
|---|---|
| **Fichero en minúsculas con prefijo `q`** | `qxxx.tsx` (no `QXxx.tsx`, no sin prefijo) |
| **Export nombrado en PascalCase** | `export const QXxx = (...)` coincide con el nombre del fichero capitalizado |
| **Tipo de props con sufijo `Props`** | `QXxxProps` definido y usado como tipo de las props |
| **Valores por defecto en desestructuración** | Los props opcionales con default (`tamaño = "mediano"`) se resuelven al desestructurar, no con `??`/`||` dentro del cuerpo |
| **Naming de props en español** | Props como `deshabilitado`, `tamaño`, `texto`, `variante` — no anglicismos (`disabled`, `size`, `label`, `variant`) salvo excepciones ya asentadas (`onClick`, `children`) |
| **Wrapper de custom element** | El JSX envuelve el elemento nativo en `<quimera-xxx {...attrs}>`, coherente con el nombre del fichero |
| **Atributos booleanos/enum como atributos HTML** | Se pasan como `attrs` al custom element (`destructivo`, `tamaño="pequeño"`), no como clases condicionales de React |
| **CSS ataca atributos del custom element** | Selectores tipo `&[destructivo]`, `&[tamaño="pequeño"]` con anidamiento CSS nativo — no BEM ni clases `.qxxx--destructivo` |
| **CSS usa variables de tema** | Colores/espaciados vía `var(--color-primario)`, `var(--espaciado-s)`, etc. — no valores hardcodeados (hex, px sueltos) salvo casos justificados |
| **`deshabilitado` propagado como atributo** | Si el átomo es interactivo, `deshabilitado?: boolean` se propaga al custom element |
| **Fichero `*.historias.ts` presente** | Existe el hermano de catálogo con `grupo`, `titulo`, `Componente`, y al menos una variante (`Base`) |
| **Registrado en `listado-historias.ts`** | El import y la entrada en el array `listadoHistorias` existen |
| **Uso de `React.forwardRef`** | Ninguno de los átomos de referencia lo usa; si el componente objetivo lo hace, señálalo como observación a evaluar caso a caso, no como fallo automático |

### 3.2 Consistencia estructural y de nomenclatura — Feature/dominio complejo

Aplica esta tabla solo a componentes de categoría feature/dominio complejo.

| Verificación | Cómo comprobar |
|---|---|
| **Carpeta en snake_case** | `arbol_documentos/`, no `ArbolDocumentos/` ni `arbolDocumentos/` |
| **Patrón DDD de 4 ficheros si aplica** | `diseño.ts` (Estado + Contexto), `dominio.ts` (transiciones puras), `maquina.ts` (`Maquina<Estado,Contexto>`), `index.ts` |
| **`diseño.ts`: Estado como unión de strings** | `type Estado = "inicial" \| "cargando" \| ...` |
| **`diseño.ts`: Contexto extends `Contexto<Estado>`** | Importado de `@olula/lib/diseño.ts`, igual que en `packages/contextos` |
| **`diseño.ts` en camelCase** | Todos los campos de `Contexto`/`Configuracion...` en camelCase, nunca snake_case (`vinculoTipo`, no `vinculo_tipo`) |
| **Props/estado del `.tsx` en camelCase** | Mismo chequeo dentro del propio componente React: props, `useState`, desestructuración — el campo no debe reaparecer en snake_case en el componente aunque `diseño.ts` ya esté corregido |
| **Componente principal sin wrapper de custom element** | Usa clases CSS normales (`className`), no el patrón `<quimera-xxx>` de átomos — esto es correcto para esta categoría, no una desviación |
| **Subcomponentes internos en PascalCase sin prefijo `q`** | `NodoArbolItem.tsx`, `AnadirDocumento.tsx` — correcto; señala como desviación si un subcomponente interno lleva prefijo `q` (se confundiría con un átomo/molécula reutilizable) |
| **Sin lógica de dominio duplicada entre componentes hermanos** | Compara `dominio.ts`/lógica de cálculo entre el componente objetivo y sus hermanos de la misma carpeta padre; si hay funciones equivalentes (p.ej. una normalización de filtro repetida), debe existir un helper compartido en `@olula/lib` en vez de reimplementarlo en cada sitio |
| **`index.ts` exporta solo la superficie pública** | No expone detalles internos que ningún consumidor externo necesite |
| **Naming del fichero principal** | `Q<Feature>.tsx` en PascalCase con prefijo `Q` (ej. `QArbolDocumentos.tsx`), a diferencia de los subcomponentes internos sin prefijo |

### 3.3 UI/UX y accesibilidad

Aplica, sobre los componentes objetivo, las directrices cargadas en el Paso 1
(`web-design-guidelines` + `designer.md`), organizando los hallazgos en **Crítico / Advertencia /
Sugerencia** — la misma clasificación que usa el agente `designer`.

Añade además estas 3 comprobaciones propias de Quimera Olula, que las guías genéricas de
accesibilidad web no cubren porque asumen HTML nativo y aquí los componentes suelen envolver
custom elements (`<quimera-xxx>`) sin semántica implícita:

| Verificación | Cómo comprobar |
|---|---|
| **Roles/ARIA explícitos en interacciones custom** | Si el componente representa un control interactivo no nativo (árbol, lista seleccionable, acordeón...), ¿tiene los roles ARIA que un elemento HTML nativo tendría implícitos (`role="tree"`, `role="treeitem"`, `aria-expanded`, `aria-selected`, `aria-label`...)? No lo des por bueno solo porque el resto de átomos tampoco los tengan — señala la ausencia como hallazgo. |
| **Foco visible y navegación por teclado** | Para cada interacción de usuario (clic en nodo, abrir/cerrar, seleccionar fila, arrastrar y soltar...) ¿existe equivalente accesible por teclado (Tab/Enter/Espacio/flechas) y un estado de foco visible (`:focus-visible`), o solo funciona con ratón? |
| **Soporte de dark mode vía tema** | El CSS del componente ¿usa exclusivamente variables de tema (`var(--color-...)` de `packages/componentes/src/tema/tema.css`), o hay colores hardcodeados que romperían en dark mode? |

### 3.4 Calidad de código general

| Verificación | Cómo comprobar |
|---|---|
| **Sin código muerto / props no usadas** | Props declaradas en `QXxxProps` que no se leen en el cuerpo del componente; imports no usados; funciones exportadas que ningún consumidor referencia (`grep` en el resto del monorepo) |
| **Tipado estricto, sin `any`** | Busca `any` en los ficheros objetivo; cada uso debe estar justificado (interoperabilidad con librería externa) o señalado como desviación |
| **Sin duplicación de lógica interna** | Funciones equivalentes repetidas dentro del propio componente o entre sus subcomponentes (más allá del chequeo entre hermanos de 3.2) |
| **Naming consistente de handlers** | Props de callback `onXxx` (`onClick`, `onNodoSeleccionado`); funciones internas que los implementan `handleXxx` — sin mezclar convenciones distintas en el mismo fichero |
| **Tamaño/complejidad del componente** | Componentes `.tsx` de más de ~200-300 líneas o con anidamiento condicional profundo son candidatos a extraer subcomponentes o hooks; señala si concentra lógica de dominio que debería vivir en `dominio.ts` |
| **Nombres descriptivos** | Sin variables/parámetros de una sola letra o abreviados sin contexto (fuera de índices de bucle triviales) |
| **`pnpm lint` sin errores nuevos** | Ejecuta `pnpm --filter @olula/componentes lint` y revisa los ficheros objetivo |
| **`pnpm type-check` sin errores** | Ejecuta `pnpm --filter @olula/componentes type-check` y revisa los ficheros objetivo |

> Esta dimensión se inspira en las categorías del skill `code-review` (correctness, reuse,
> simplificación, eficiencia), pero no lo invoca: `code-review` está orientado a diffs de cambios
> pendientes, y aquí se audita código ya existente y potencialmente mergeado hace tiempo, sin un
> diff de referencia.

## Paso 4 — Generar informe

Un bloque por componente auditado y, si se auditó más de uno, un resumen agregado al principio:

```markdown
# Auditoría de componente(s): {lista_de_componentes}

## Resumen agregado (si son varios componentes)
- Componentes auditados: {N}
- Alineamiento medio: {porcentaje}%
- Desviaciones totales: {N} ({n1} → alinear, {n2} ← actualizar convención, {n3} ⊘ extensión)

---

## {nombre_componente} ({ruta})

### Resumen
- Categoría: átomo | molécula | feature/dominio complejo
- Alineamiento: {porcentaje}%
- Desviaciones: {N} ({n1} → alinear componente, {n2} ← actualizar convención, {n3} ⊘ extensión)

### 1. Consistencia estructural y de nomenclatura
{lista de ✓ y ✗ con categoría, según la tabla 3.1 o 3.2 aplicada}

### 2. UI/UX y accesibilidad
{hallazgos Crítico / Advertencia / Sugerencia, incluyendo las 3 comprobaciones propias de Quimera}

### 3. Calidad de código general
{lista de ✓ y ✗ con categoría según la tabla 3.4, incluyendo resultado de pnpm lint / type-check}

### Recomendaciones
#### → Alinear componente
{cambios concretos, incluyendo hallazgos Crítico/Advertencia de la sección 2 atribuibles al componente}

#### ← Actualizar convención
{patrones que el componente resuelve mejor que sus pares y que deberían generalizarse o documentarse}

#### ⊘ Extensiones de dominio (no requieren acción)
{diferencias específicas del dominio/feature que no son un fallo}

---
{repetir por cada componente}
```

## Criterios para el diagnóstico

### → Alinear componente
El resto del ecosistema (átomos hermanos, componentes hermanos de la misma feature, o el patrón
DDD de `packages/contextos`) tiene el patrón correcto y el componente objetivo se desvía sin
justificación:
- Naming en snake_case en `diseño.ts` o en el propio `.tsx` cuando el resto usa camelCase
- Carpeta en PascalCase en vez de snake_case
- Lógica duplicada con un componente hermano en vez de un helper compartido
- Ausencia de fichero `*.historias.ts` en un átomo/molécula que debería tener catálogo
- Hallazgos **Crítico** o **Advertencia** de la sección UI/UX sobre el propio componente (ARIA
  ausente en interacción custom clave, sin foco visible, colores hardcodeados que rompen dark
  mode)
- `any` sin justificar, código muerto, props no usadas
- Errores de `pnpm lint` / `pnpm type-check`

### ← Actualizar convención
El componente objetivo tiene un patrón más completo o mejor resuelto que el resto de sus pares, y
debería generalizarse o documentarse (no hay `STYLEGUIDE.md` hoy — esto puede ser la motivación
para crear uno):
- Un enfoque de composición, tipado, o separación `diseño.ts`/`dominio.ts` más limpio que el de
  sus hermanos
- Una solución de accesibilidad (roles ARIA, manejo de foco) que debería replicarse en otros
  componentes con interacciones custom similares
- Un helper reutilizable que debería promoverse a `@olula/lib` para que otros componentes lo
  adopten

### ⊘ Extensión de dominio
La diferencia es funcionalidad o estructura específica del dominio/feature, no un fallo:
- Subcomponentes internos propios de la feature (`NodoArbolItem.tsx`, `AnadirDocumento.tsx`)
- Ausencia de wrapper de custom element en componentes de feature/dominio complejo (correcto para
  esa categoría, no para átomos/moléculas)
- Hallazgos de tipo **Sugerencia** que dependen de una decisión de producto fuera del alcance de
  esta auditoría
