# Plan: nueva línea visual de maestros y panel de widgets

> Estado: **aplazado**: diseño aprobado para revisión con el equipo, sin implementar.
> Bocetos: https://claude.ai/artifact/8bfN7zPccnL1MkrugdmU3M (lienzo "Olula — nueva línea visual").
> Fecha: 2026-10-23.

## Objetivo

Mejorar lo que hay sin rehacerlo:

1. Dar aire y jerarquía a la vista de tarjetas del maestro.
2. Añadir un panel de widgets dinámicos encima de cada maestro que totalice datos del listado
   (según los filtros activos), con widgets por defecto y personalizables por el usuario.
3. Pulir el modo tabla y el detalle con el mismo lenguaje visual.

## Restricción: los campos de formulario no se tocan

**No se modifican `qinput` ni ningún átomo de tipo input**, ni su apariencia:

- `atomos/qinput.tsx`, `qselect.tsx`, `qdate.tsx`, `qdateinterval.tsx`, `qfechahora.tsx`,
  `qmonthyear.tsx`, `qnumberinterval.tsx`, `qtextarea.tsx`, `qcheckbox.tsx`,
  `qmulticheckbox.tsx`, `qradio.tsx`, `_forminput.tsx` y sus `.css`.
- `atomos/_forminput.css` y `atomos/qform.css` (`quimera-formulario`).
- Tampoco el autocompletar (`quimera-autocompletar`) ni los filtros que se construyen con esos átomos.

Consecuencias para el resto del plan:

- **Los tokens que consumen los inputs no cambian de valor**: `--altura-control`,
  `--color-borde-sutil`, `--color-borde-focus`, `--color-fondo-focus`, `--color-primario`,
  `--color-primario-claro`, `--color-primario-oscuro`, `--color-borde-editando`,
  `--grosor-borde-editando`, `--color-texto-primario`, `--color-texto-secundario`,
  `--color-texto-deshabilitado`, `--color-accion`, `--color-error*`, `--color-advertencia*`,
  `--tamaño-letra-m/s`, `--espaciado-xxs`, `--gap-formulario`.
  Todo lo nuevo se hace con **tokens nuevos** (solo se añaden, no se redefinen).
- Los formularios del detalle y del panel de personalización usan `QInput`/`QSelect`/`QRadio`
  tal cual (estilo subrayado actual). Los bocetos ya reflejan ese aspecto.
- No se crean controles de entrada nuevos (p. ej. selector de píldoras): donde hace falta elegir
  una opción se usa `QSelect`.
- Los cambios de CSS en contenedores (tarjeta de detalle, rejilla de formulario del detalle) no deben
  alcanzar a los selectores `quimera-input`, `quimera-select`, etc.: nada de reglas descendentes
  que les cambien bordes, alturas, colores o rellenos.

## Diagnóstico (estado actual)

- `atomos/qtarjetas.css`: hueco entre tarjetas `--espaciado-xs` (0,3rem) y relleno vertical
  `--espaciado-xxs` (0,2rem). Una sola columna aunque el maestro ocupe el 100 % del ancho.
- `moleculas/qtarjeta_generica.css`: toda la fila superior en `font-size: large`. Código, cliente y
  total compiten. El degradado de fondo y el `::before` añaden ruido.
- `--color-primario` (#6C9099) con texto blanco ≈ 3,4:1 → no cumple 4,5:1 en botones/enlaces.
- La API de listados solo devuelve `total` (recuento). Con scroll infinito, sumar en cliente
  solo cubre la página cargada → **los widgets necesitan agregados del backend**.
- Precedentes: `atomos/qtarjeta_resumen.tsx` y
  `contextos/src/tesoreria/conexion_bancaria/maestro/TarjetasSaldosConexionBancaria.tsx` (ad hoc).

## Fases

### Fase 1 · Pulido visual (solo CSS + tokens nuevos, bajo riesgo)

1. Tokens nuevos en `tema/tema.css` (sin tocar los existentes):
   - `--color-primario-texto` (#3f5f67) para botones primarios y enlaces con contraste AA.
   - `--color-fondo-maestro` (≈ `--color-superficie-sunken`) detrás del maestro.
   - `--espaciado-tarjeta`, `--hueco-tarjetas` (cómoda/compacta).
2. `atomos/qtarjetas.css`:
   - Hueco `--espaciado-m`, relleno `--espaciado-m`/`--espaciado-l`, fondo plano (sin degradado ni `::before`).
   - Seleccionada: borde `--color-primario` + halo suave.
   - Rejilla `repeat(auto-fill, minmax(300px, 1fr))` cuando `.Maestro` no está `contraido`;
     una columna cuando hay detalle abierto.
3. `moleculas/qtarjeta_generica`: jerarquía (código pequeño en gris, cliente destacado,
   importe con `tabular-nums`) y un hueco opcional para la etiqueta de estado.
4. Densidad cómoda/compacta como preferencia (`usePreferencia`) → atributo `data-densidad`.
5. Modo tabla (`atomos/qtabla.css`): filas de ~44 px, sin cebra (solo hover y selección),
   cabecera suave, numéricos a la derecha, paginación "1–10 de N".
6. Detalle (`detalle/detalle.css`, `Detalle.tsx`): cabecera con código + estado + título,
   acciones agrupadas (principal visible y el resto en "⋯"), franja de datos clave,
   pestañas subrayadas, totales en bloque a la derecha. **Los campos siguen siendo los mismos
   átomos sin cambios**; solo se ajusta la rejilla contenedora.
7. Revisión visual en las apps que comparten componentes.

### Fase 2 · Agregados en backend (olula_servidor)

- Endpoint genérico por entidad, p. ej.
  `GET …/factura/agregados?filtro=…&agregados=total:suma,total:media,*:recuento`.
- Reutiliza el filtro del listado (`criteriaQuery`).
- Lista blanca de campos agregables por entidad (seguridad y rendimiento).

### Fase 3 · `QPanelWidgets` en `@olula/componentes`

- Tipo: `DefinicionWidget { id, titulo, campo, operacion: "suma" | "media" | "recuento" | "max" | "min" | "porcentaje", filtro?, formato: "moneda" | "numero" | "porcentaje", defecto? }`.
- Prop nueva `widgets?: DefinicionWidget[]` en `Listado` (ya conoce el `criteria`). El panel se
  pinta encima de `listado-cabecera`.
- Recalcula con debounce al cambiar filtros; no al paginar.
- Con el maestro contraído: muestra los 2 primeros en versión compacta + "Ver los N widgets".
- Evolucionar `QTarjetaResumen` en vez de crear otro componente.
- Opcional: registrar en `useControlPantalla` para consultas por voz.

### Fase 4 · Personalización

- Panel lateral (boceto "Personalizar widgets") construido con `QInput`, `QSelect` y `QRadio` existentes.
- Persistencia: primero `usePreferencia` (clave `widgets:<entidad>`), después en servidor por
  usuario + widgets por defecto de empresa. Botón "Restaurar por defecto".

### Fase 5 · Despliegue

- Piloto en Facturas.
- Después pedidos, albaranes, presupuestos, compras y almacén, con 3–4 widgets por defecto
  definidos en el `dominio.ts` de cada módulo.

## Bocetos (lienzo)

| Tablero | Contenido |
|---|---|
| 0 · Actual | Referencia reconstruida desde el CSS actual |
| A · Rejilla de tarjetas + widgets | Propuesta recomendada para el maestro |
| B · Lista espaciada + franja de totales | Alternativa más sobria |
| Maestro en modo tabla | Tabla pulida con widgets |
| Personalizar widgets | Panel lateral (interactivo) con los inputs actuales |
| Detalle en móvil | 390×844 |
| Maestro contraído + detalle | Detalle con pestañas (interactivo) y campos con el estilo actual |

## Decisiones pendientes

1. A, B o mezcla (recomendado: widgets de A + rejilla sin selección, una columna con detalle abierto).
2. Quién implementa el endpoint de agregados.
3. Persistencia local o en servidor desde el inicio.
4. Widgets "para toda la empresa" en la primera versión o más adelante.
5. Acción principal del detalle según estado ("Emitir" en borrador, "Imprimir" emitida).
6. Si las líneas pasan a ser la primera pestaña.
