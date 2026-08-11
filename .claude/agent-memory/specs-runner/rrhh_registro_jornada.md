# Memoria técnica — rrhh / registro_jornada

## Comando de tests

```bash
pnpm run --filter @olula/ctx test -- src/rrhh/registro_jornada/test/ --run
```

## Ficheros clave

| Fichero | Contenido |
|---|---|
| `diseño.ts` | Tipos: `RegistroJornada` (incluye `minutosJornada: number`), `NuevaJornada`, `CambiosJornada`, `PausaJornada`, `EstadoJornada`. `PatchAprobarJornada = (ids: string[]) => Promise<void>`. **Nuevos:** `EventoVerificado`, `ResultadoVerificacionJornada`, `GetVerificarFirma` |
| `dominio.ts` | Re-exporta `rrhh_comun/dominio.ts`: `registroJornadaVacio`, `metaRegistroJornada`, `minutosAHorasMinutos`, `puedeAprobarse` |
| `infraestructura.ts` | Mappers API↔dominio (`registroJornadaDesdeApi`), llamadas REST. `patchAprobarJornada` usa `PATCH /registro_jornada/aprobar` con body `{ ids }` (bulk, sin ID en URL). **Nuevo:** `getVerificarFirma(desde: string \| null): Promise<ResultadoVerificacionJornada>` con GET a `VERIFICAR_FIRMA` |
| `comun/urls.ts` | URLs base: `JORNADA = '/rrhh/jornada'`. **Nuevo:** `VERIFICAR_FIRMA = '/rrhh/registro_jornada/verificar_firma'` (URL diferente a JORNADA) |
| `detalle/diseño.ts` | Estados y contexto del detalle: `EstadoDetalleJornada`, `ContextoDetalleJornada` |
| `detalle/dominio.ts` | Procesadores de contexto: `cargarContexto`, `refrescarJornada`, `jornadaAEstado` |
| `detalle/maquina.ts` | Máquina de estados del detalle de jornada |
| `detalle/DetalleJornada.tsx` | Vista principal del detalle |
| `crear/diseño.ts` | `NuevaJornadaForm`, `metaNuevaJornada` (con validaciones de campos para creación) |
| `crear/CrearJornada.tsx` | Modal de creación de jornada |
| `pausas/diseño.ts` | `PausaForm`, `metaPausaForm(jornada, pausaId?)` (función de fábrica con validaciones de intervalo y solapamiento), `pausaFormInicial`, `pausaFormDesde` |
| `pausas/` | Submódulo de gestión de pausas (crear, editar, borrar) |
| `maestro/diseño.ts` | `metaTablaJornada`, `ContextoMaestroJornadas` (incluye `seleccionadas: string[]`), `EstadoMaestroJornadas` (incluye `'APROBANDO_JORNADAS'` y `'REVISANDO_JORNADAS'`) |
| `maestro/dominio.ts` | `todasPuedenAprobarse(ids, jornadas)`, `aprobarJornadas` (procesador que llama a bulk API y recarga lista) |
| `maestro/maquina.ts` | Estado `APROBANDO_JORNADAS` con `jornadas_aprobadas` y `aprobacion_multiple_cancelada`; **nuevo** estado `REVISANDO_JORNADAS` con `jornadas_revisadas: "INICIAL"` y `revision_de_firma_cancelada: "INICIAL"` (string puro, sin procesador) |
| `maestro/AprobarJornadas.tsx` | Modal de confirmación para aprobación múltiple |
| `maestro/RevisarFirmaJornadas.tsx` | **Nuevo.** Modal con estado interno React: fase formulario (input `datetime-local` opcional) → llama `getVerificarFirma` → fase resultado (tabla de eventos con firma_valida coloreada). Al cerrar emite `jornadas_revisadas`; al cancelar emite `revision_de_firma_cancelada`. La API se llama dentro del componente, no via procesador de máquina |
| `maestro/MaestroConDetalleJornada.tsx` | Listado con multiselección; botón "Aprobar (n)" condicionado a `todasPuedenAprobarse`; **nuevo** botón "Verificar firma" (siempre visible); renderiza `<RevisarFirmaJornadas>` cuando `estado === "REVISANDO_JORNADAS"` |
| `test/dominio.test.ts` | Tests unitarios de dominio |
| `test/pausas.test.ts` | Tests unitarios de pausas |

## Patrones de validación en MetaModelo

Las validaciones de campo se definen como funciones `(modelo) => boolean | string` en la propiedad `validacion` de cada campo del `MetaModelo`. Reciben el modelo completo para poder comparar campos entre sí. Devuelven `true` si es válido, `false` si inválido sin mensaje, o un string con el mensaje de error.

Las validaciones se añaden **en el mismo fichero donde se define el `MetaModelo`** (`dominio.ts` para edición, `crear/diseño.ts` para creación).

Las horas (`string | null` o `string`) se comparan directamente como strings porque el formato `"HH:MM"` / `"HH:MM:SS"` es lexicográficamente equivalente al orden temporal.

Ejemplo de referencia: `@packages/contextos/src/tpv/venta/pagar_con_tarjeta/pagar_con_tarjeta.ts`

## MetaModelo como función de fábrica

Cuando la validación necesita acceso a contexto externo al modelo (como la jornada padre o sus otras pausas), `metaXxx` se define como función de fábrica en lugar de constante:

```typescript
export const metaPausaForm = (jornada: RegistroJornada, pausaId?: string): MetaModelo<PausaForm> => ({ ... })
```

Los componentes que usan el metadato lo llaman pasando el contexto necesario:
- Crear: `useModelo(metaPausaForm(jornada), pausaFormInicial)`
- Editar: `useModelo(metaPausaForm(jornada, pausa.id), pausaInicial)`

El `pausaId` sirve para excluir la propia pausa del chequeo de solapamiento al editar.

## Solapamiento de intervalos

Dos intervalos `[a, b]` y `[c, d]` se solapan si `a < d AND c < b`. Para intervalos sin hora de fin se usa `"99:99"` como sustituto del infinito (válido por comparación lexicográfica).

## Mapeo de specs a tests (IDs)

| ID spec | Fichero de test | Función/describe |
|---|---|---|
| `[jornada-crear-01]` | `test/dominio.test.ts` | hora fin no anterior a hora inicio |
| `[jornada-cambiar-01]` | `test/dominio.test.ts` | hora fin no anterior al mayor de inicio/pausas |
| `[jornada-aprobar-01]` | `test/dominio.test.ts` | `puedeAprobarse` |
| `[maestro-01]` | `test/dominio.test.ts` | `minutosAHorasMinutos` |
| `[maestro-02]` | `test/dominio.test.ts` | `todasPuedenAprobarse` |
| `[maestro-03]` (v1) | `test/maquina.test.ts` | transición `APROBANDO_JORNADAS` → `INICIAL` vía `jornadas_aprobadas` |
| `[maestro-03]` (v2) | — | estructural, sin test (transición string pura + modal con estado React interno) |
| `[detalle-01]` | — | estructural, sin test |
