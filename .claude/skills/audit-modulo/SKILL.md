---
name: audit-modulo
description: |
  Audita un módulo existente contra las plantillas canónicas de Quimera Olula.
  Compara estructura de ficheros, patrones de máquina de estado, infraestructura y componentes.
  Produce un informe con desviaciones y recomienda: alinear el módulo, actualizar la plantilla, o aceptar como extensión de dominio.

  <example>
  user: "/audit-modulo packages/contextos/src/ventas/pedido"
  assistant: Lee la plantilla y el módulo, genera informe de alineamiento con desviaciones y recomendaciones.
  </example>

  <example>
  user: "audita el módulo tpv/venta contra la plantilla"
  assistant: Compara tpv/venta con _plantilla/modulo + _con_lineas y reporta diferencias.
  </example>
---

# Audit Módulo — Quimera Olula

Auditas módulos existentes contra las plantillas canónicas en `packages/contextos/src/_plantilla/modulo/`.

## Paso 0 — Determinar ruta y tipo de módulo

1. Recibe la ruta del módulo (ej. `packages/contextos/src/ventas/pedido`).
2. Lee la estructura de ficheros del módulo objetivo.
3. Determina si es un **módulo simple** o **módulo con líneas**:
   - Busca carpetas `crear_linea/`, `cambiar_linea/`, `borrar_linea/` o `detalle/lineas/`
   - Busca `LineaXxx` en `diseño.ts`
   - Si tiene alguno → módulo con líneas → plantilla base + `_con_lineas/`
   - Si no → módulo simple → solo plantilla base

## Paso 1 — Cargar plantillas de referencia

Lee los ficheros de la plantilla correspondiente:

**Siempre:**
- `_plantilla/modulo/diseño.ts`
- `_plantilla/modulo/infraestructura.ts`
- `_plantilla/modulo/maestro/diseño.ts`
- `_plantilla/modulo/maestro/maquina.ts`
- `_plantilla/modulo/maestro/maestro.ts`
- `_plantilla/modulo/maestro/MaestroConDetalleModulo.tsx`
- `_plantilla/modulo/detalle/diseño.ts`
- `_plantilla/modulo/detalle/maquina.ts`
- `_plantilla/modulo/detalle/detalle.ts`
- `_plantilla/modulo/detalle/DetalleModulo.tsx`
- `_plantilla/modulo/crear/crear.ts`
- `_plantilla/modulo/crear/CrearModulo.tsx`
- `_plantilla/modulo/borrar/BorrarModulo.tsx`

**Si módulo con líneas, también:**
- `_plantilla/modulo/_con_lineas/README.md`
- Los ficheros de reemplazo y adición listados en ese README

## Paso 2 — Leer el módulo objetivo

Lee la estructura de ficheros completa y el contenido de los ficheros clave:
- `diseño.ts` (interfaces, type signatures)
- `infraestructura.ts` (mappers, funciones CRUD)
- `maestro/maquina.ts` o equivalente (estados del maestro)
- `detalle/maquina.ts` o equivalente (estados del detalle)
- `detalle/detalle.ts` o `detalle/dominio.ts` o equivalente (lógica de detalle)
- El componente principal del detalle (DetalleXxx.tsx)
- El componente del maestro (MaestroXxx.tsx)
- Los modales de crear, borrar, y si aplica, crear_linea, cambiar_linea, borrar_linea

## Paso 3 — Verificaciones

Ejecuta las siguientes verificaciones comparando el módulo con la plantilla.

### 3.1 Estructura de ficheros

| Verificación | Cómo comprobar |
|---|---|
| **Ficheros esperados presentes** | Cada fichero de la plantilla tiene su equivalente en el módulo (con nombre adaptado al dominio) |
| **Ficheros extra no contemplados** | Ficheros en el módulo que no tienen equivalente en la plantilla |
| **Carpetas en snake_case** | Todas las carpetas usan snake_case, NO PascalCase |
| **Nombre de operaciones de línea** | `crear_linea/`, `cambiar_linea/`, `borrar_linea/` — no `editar_linea/`, no `nueva_linea/` |
| **Ubicación de operaciones de línea** | En el nivel raíz del módulo (o `vistas/`), NO dentro de `detalle/` ni de `lineas/` |
| **Orquestador de líneas** | En `detalle/lineas/LineasXxx.tsx`, no en otra ubicación |

### 3.2 Patrones de diseño.ts

| Verificación | Cómo comprobar |
|---|---|
| **Interfaz principal extends Entidad** | La entidad principal tiene `extends Entidad` |
| **NuevoXxx + CambiosXxx** | Existen los tipos para crear y actualizar |
| **Type signatures de infraestructura** | `GetXxx`, `PostXxx`, `PatchXxx`, `DeleteXxx` definidos |
| **Si con líneas: entidad con lineas[]** | La interfaz principal contiene `lineas: LineaXxx[]` (o `GetLineasXxx` si usa endpoint separado) |

### 3.3 Patrones de infraestructura.ts

| Verificación | Cómo comprobar |
|---|---|
| **Interfaces API en snake_case** | `XxxApi` con campos en snake_case |
| **Mappers bidireccionales** | `xxxDesdeApi` (API→dominio) y `nuevoXxxAApi` / `cambiosXxxAApi` (dominio→API) |
| **Funciones CRUD con RestAPI** | `getXxx`, `getXxxs`, `postXxx`, `patchXxx`, `deleteXxx` |
| **Si con líneas: CRUD de líneas** | `postLineaXxx`, `patchLineaXxx`, `deleteLineaXxx` |

### 3.4 Patrones de máquina de estado

| Verificación | Cómo comprobar |
|---|---|
| **Maestro: estados INICIAL + CREANDO** | La máquina tiene ambos estados, CREANDO abre modal |
| **Maestro: eventos de lista** | `modulo_seleccionado`, `criteria_cambiado`, `siguiente_pagina`, `crear_modulo_solicitado` |
| **Maestro: incluirXxxCreadoPorId** | El handler de `modulo_creado` en CREANDO obtiene la entidad y la incluye |
| **Detalle: estados INICIAL + ABIERTO + BORRANDO** | Los 3 estados base están presentes |
| **Si con líneas: +3 estados** | `CREANDO_LINEA`, `CAMBIANDO_LINEA`, `BORRANDO_LINEA` |
| **Detalle: cargarContexto al cambiar ID** | Evento `modulo_id_cambiado` → `cargarContexto` |

### 3.5 Patrones de detalle.ts

| Verificación | Cómo comprobar |
|---|---|
| **metaXxx con validaciones** | Objeto `MetaModelo` con validaciones de campos |
| **xxxVacio()** | Función que devuelve la entidad con valores por defecto |
| **refrescarXxx** | Recarga desde API y publica `modulo_cambiado` |
| **guardarXxx** | Compara campos y PATCH si hay cambios |
| **cargarContexto** | Obtiene entidad por ID, transiciona a ABIERTO |
| **Si con líneas: refrescarModLin sincroniza lineas** | `refrescarXxx` también actualiza `lineas.lista` desde la entidad |
| **Si con líneas: handlers de línea** | `onLineaCreada`, `onLineaCambiada`, `onLineaBorrada` existen |

### 3.6 Patrones de componentes

| Verificación | Cómo comprobar |
|---|---|
| **Modales sin prop `activo`** | Los modales de crear/borrar/cambiar NO reciben `activo: boolean` |
| **Visibilidad controlada por padre** | `{estado === "CREANDO" && <CrearXxx />}` |
| **CrearXxx usa useForm + useModelo** | No usa ContextoError.intentar directamente |
| **BorrarXxx usa useForm** | No llama directamente a la API |
| **Modales reciben entidad resuelta** | `linea: LineaXxx`, nunca `linea?: LineaXxx | null` |

## Paso 4 — Generar informe

Produce un informe con este formato:

```markdown
# Auditoría: {ruta_modulo} vs _plantilla/modulo [+ _con_lineas]

## Resumen
- Tipo: módulo simple | módulo con líneas
- Alineamiento: {porcentaje}%
- Desviaciones: {N} ({n1} → alinear módulo, {n2} ← actualizar plantilla, {n3} ⊘ extensión)

## Estructura de ficheros
{lista de ✓ y ✗ con categoría}

## Patrones de diseño
{lista de ✓ y ✗ con categoría}

## Recomendaciones
### → Alinear módulo a plantilla
{lista de cambios concretos en el módulo}

### ← Actualizar plantilla
{lista de patrones que la plantilla debería adoptar}

### ⊘ Extensiones de dominio (no requieren acción)
{lista de diferencias que son específicas del dominio}
```

## Criterios para el diagnóstico

### → Alinear módulo a plantilla
La plantilla tiene el patrón correcto y el módulo se desvía sin justificación:
- Nombres de carpeta incorrectos (PascalCase, `editar_` vs `cambiar_`)
- Modal con prop `activo` cuando debería ser renderizado condicional
- Falta fichero `diseño.ts` en maestro o detalle
- Usa `ContextoError.intentar` en crear cuando debería usar `useForm`

### ← Actualizar plantilla
El módulo tiene un patrón más completo que la plantilla debería adoptar:
- `dominio.ts` local en operaciones (crear/, crear_linea/) si aporta cohesión
- Componente extra reutilizable no contemplado
- Patrón de infraestructura más limpio

### ⊘ Extensión de dominio
La diferencia es funcionalidad extra específica del dominio:
- Operaciones adicionales (pagos, devoluciones en TPV)
- Tabs especializados (TabCliente, TabObservaciones)
- Componentes específicos del negocio
