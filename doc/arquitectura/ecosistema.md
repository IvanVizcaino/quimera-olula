# El ecosistema Quimera Olula: frontend, backend y MCP

Este documento da una visión de conjunto de los **tres repositorios** que forman el producto Olula, para no tener que re-explorarlos cada vez que se empieza a trabajar. Cada repo tiene su propio `CLAUDE.md` con el detalle de convenciones internas; aquí se recoge cómo encajan entre sí y lo que no está escrito en ninguno de los tres.

| Repo | Ruta local | Qué es |
|---|---|---|
| **quimera-olula** | `/home/ivan/quimera-olula` | Frontend React/TypeScript (monorepo pnpm), un cliente por negocio (tenant) |
| **olula_servidor** | `/home/ivan/git_yeboyebo/olula_servidor` | Backend FastAPI, arquitectura hexagonal + CQRS, un ERP multi-tenant |
| **olula_mcp** | `/home/ivan/olula_mcp` | Servidor MCP que expone el ERP como *tools* para agentes de IA |

Los tres son consumidores del **mismo backend HTTP**: el frontend habla con él vía `RestAPI` (fetch + JWT), y el MCP habla con él vía `requests` (reenviando el mismo JWT del usuario, o una API key de servicio). No hay una API distinta para "modo agente"; el MCP es un proxy de identidad transparente sobre la misma API que usa la web.

```
Usuario humano ──▶ quimera-olula (React) ──┐
                                            ├──▶ olula_servidor (FastAPI, CQRS) ──▶ PostgreSQL
Agente de IA   ──▶ olula_mcp (tools MCP) ───┘
```

---

## 1. Frontend — quimera-olula

Ver `CLAUDE.md` del repo para la arquitectura DDD de 4 ficheros, `useMaquina`, `useLista`, plantillas canónicas, etc. Lo que añade este documento:

### Apps = tenants
`apps/` tiene ~17 apps activas, cada una un **cliente/negocio real** sobre el mismo core (`packages/lib`, `packages/contextos`, `packages/componentes`): `almaeventos, barnaplant, cabrera, cash, crema_cafe, dulce_bebe, ecofricalia, elganso_stores, guanabana, monterelax_area_clientes, nadia, naranjas_jimenez, sanhigia, yeboyebo`. `olula` y `olula_area_empleado` son el "producto genérico" (ERP estándar y portal de empleado). Cada app tiene su propio `.env` (`VITE_API_URL` apunta a su propio backend/tenant) y su propio workflow de CI/CD que construye y despliega un contenedor Docker independiente. `legacy/` conserva la arquitectura pre-monorepo de estos mismos clientes, útil como referencia de migración.

### Cómo habla con el backend
- `packages/lib/src/api/rest_api.ts`: `BASE = import.meta.env.VITE_API_URL`. Inyecta siempre `Authorization: Bearer <token>` leído de `tokenAcceso` (localStorage). Soporta JSON/FormData/blob/text.
- Auth vive en `packages/contextos/src/auth/`: `login/`, `usuario/`, `grupos/` (permisos), `passkey/` (WebAuthn), `middlewares.ts` (guard de rutas), `useTimerRefresco.ts`. Token de acceso expira a los 15 min, se refresca si quedan ≤3 min. Endpoints: `POST /auth/login`, `/auth/refrescar`, `/auth/logout`, `/auth/permiso/whoami`, `/auth/reset-password/*`.

### Bounded contexts completos en `packages/contextos/src/`
`almacen, asistente, auth, compras, comun, crm, rrhh, rrhh_area_empleado, rrhh_comun, tpv, valores, ventas` (+ `_plantilla`, `test`). Los que no aparecen en el `CLAUDE.md` del frontend: **`asistente`** (chat IA con adjuntos/streaming/grabación de audio — el cliente de este propio MCP/agentes), y **`rrhh` / `rrhh_area_empleado` / `rrhh_comun`** (jornada laboral, fichajes, portal del empleado).

### Patrón Factory/DI (sobrecarga por cliente)
Documentado también en `doc/arquitectura/sobrecarga.md`. Mecanismo en `packages/lib/src/factory_ctx.tsx`: `FactoryObj` (objeto global mutable con `app`/`menu`/`widgets` + setters) y `FactoryProvider` (contexto React). Cada dominio define una clase `Factory<Dominio>Olula` con propiedades estáticas por defecto (ej. `packages/contextos/src/tpv/factory.ts`). Una app la sobreescribe extendiendo la clase (`class FactoryTpvDulceBebe extends FactoryTpvOlula { static override venta_CrearVenta = CrearVentaDulceBebe }`) y registra la instancia en `main.tsx` vía `FactoryObj.setApp(...)`. Los componentes del core resuelven en runtime contra `FactoryObj.app` (sistema de "slots"). Este es el mecanismo que usa el skill `/inject-factory`.

### Utilidades y componentes adicionales
- `packages/lib/src/`: además de `useMaquina/useLista/useForm/useModelo` → `useFocus`, `useLayout`, `useEsMovil`, `usePreferencia`, `router.ts`, `menu.ts`, `widgets.ts`, `carritoLineas.ts`, `entidad.ts`, `ListaEntidades`/`ListaActivaEntidades`, `impresion.ts`, `fecha.ts`, `funcional.ts`, `api/server_sent_events_session.ts` (SSE).
- `packages/componentes/src/`: 186 ficheros — átomos (39, `qboton`, `qcheckbox`, `qdate`, `qicono`, `qavatar`...), moléculas (20, `qmodal`, `qautocompletar`, `qacordeon`, `qeditor_enriquecido`...), y componentes de dominio complejos (`arbol_documentos`, `gestor_documentos`, `calendario`, `maestro`, `detalle`, `slot` — soporte del sistema de factory).

### Testing y CI
Vitest en todo el monorepo (`pnpm run ci` = lint + type-check + test agregado vía `pnpm -r`). Patrón de test predominante: funciones puras de infraestructura (mappers snake_case↔camelCase) y hooks/componentes con `@testing-library`, sin mock centralizado de `RestAPI`. CI: `.github/workflows/testeo.yml` en cada push/PR a `main`; un workflow de build+deploy por cliente generado desde `cliente.template`.

---

## 2. Backend — olula_servidor

Ver `CLAUDE.md` del repo para hexagonal + CQRS + DI vía INI (ya documentado en detalle). Lo que añade este documento:

### Arranque
`main.py <app>` es el entrypoint recomendado (`make dev`/`make prod`): importa `apps.<app>.config`, `cargar_dependencias()`, resuelve `comun.init.levantar` (arranca HTTP + cron + colas). `api.py` (solo HTTP) y `cron.py` (solo cron) existen pero están marcados deprecated. Variable de entorno `ENV` controla `dev/prod/test/e2e`.

### Apps = mismos tenants que el frontend
26 subdirectorios en `apps/`, uno por cliente (mismos nombres que en el frontend: `sanhigia`, `dulce_bebe`, `nadia`, `crema_cafe`, `yeboyebo`, `guanabana`...) más `olula` (app base genérica) y `olula_max` (variante ampliada). Cada uno tiene su propio `config.py` + `_dependencias/*.ini` para personalizar wiring, y opcionalmente sus propios `comandos/`/`consultas/`/`_controladores/` cuando el cliente necesita lógica propia.

### Bounded contexts (mapa de dominio de negocio)
`comandos/` y `consultas/`: `almacen, auth, compras, comun, crm, documental, rrhh, tesoreria, tpv, ventas` + `contabilidad` (solo comandos) + `ecommerce` (solo comandos) + `predicciones` (solo consultas). Coincide en gran medida con los bounded contexts del frontend (falta `contabilidad`/`ecommerce`/`predicciones` en el frontend porque quizá aún no tienen UI, o se consumen solo vía API/MCP).

### Otros directorios de la raíz
- **`contratos/`** — catálogo compartido de eventos de dominio entre bounded contexts (`EventoDominio` + payloads `TypedDict`), no OpenAPI. Ej. `contratos/ventas` define `EventoFacturaEmitida` que puede consumir `tesoreria`.
- **`herramientas/`** — solo scripts de infra: `crear-bd.sh`/`exportar-bd.sh` (dump/restore de BD de test, usados por Makefile) y `generar_dockerignore.py`. Sin relación con las tools del MCP.
- **`despliegues/`** — manifiestos Kubernetes (Deployment/Service/Ingress/cert-manager) para algunos clientes. Imagen Docker única parametrizada por `APP` env var; CI por cliente (rama `<Cliente>_Produccion`) hace build+push a `yeboyebohub/olula_server` y el pod arranca con `make prod_no_log app=$APP` (redis embebido + `main.py`).
- **`skills-lock.json`** — lockfile de skills de Claude Code instaladas desde GitHub (hash de integridad), análogo al `pnpm-lock.yaml` pero para skills.
- **`.claude/agents/`** — 8 subagentes propios del flujo TDD/CQRS de este repo: `command-coder`, `query-coder`, `api-coder`, `test-designer`, `itest-designer`, `report-coder` (PDFs), `app-customizer` (overrides por cliente), `code-improver`. Con memoria persistente en `.claude/agent-memory/` (incluye memorias por módulo del flujo `specs-runner`).

### Auth (`comun/auth/`)
JWT (`pyjwt`) con implementación intercambiable por DI (`jwt/` real vs `memoauth/` en memoria para tests). Access + refresh tokens con expiración configurable. `tenancy.py` para multi-tenant. Permisos/grupos/API keys/passkeys viven como módulos CQRS completos en `comandos/auth/` (`grupo`, `permiso`, `apikey`, `passkey`, `token`, `usuario`).

---

## 3. Servidor MCP — olula_mcp

Sin `CLAUDE.md` propio (todo lo aprendido está aquí). Servidor MCP en Python (`fastmcp`) que expone como *tools* las operaciones del ERP para que agentes de IA las usen en lenguaje natural.

### Arquitectura
- `server.py` crea la instancia `FastMCP("olula")` e importa `tools/*` (registro por *import side-effect*).
- `main.py` soporta dos transportes: `stdio` (subproceso, ej. Claude Desktop) y `http` (por defecto — monta Starlette con `sse_app()` en raíz y `streamable_http_app()` bajo `/mcp`, más `/health`).
- `AuthForwardMiddleware` (ASGI) extrae `Authorization`/`x-api-key` de cada request y los guarda en un `ContextVar` para que las tools los reenvíen sin pasarlos como parámetro explícito.

### `tools/` — un fichero por dominio
`ventas.py` (el mayor: clientes, artículos, presupuestos/pedidos/albaranes/facturas), `crm.py`, `almacen.py`, `tpv.py`, `tesoreria.py`, `compras.py`, `predicciones.py`, `documental.py`, `comun.py` (catálogos). Convención uniforme: `buscar_*` (listado paginado + filtro), `obtener_*` (por ID), `crear_*`/`actualizar_*`, y acciones de negocio (`aprobar_*`, `emitir_*`). Las docstrings en español son ricas y actúan como prompt/schema para el LLM (explican cómo interpretar campos, valores válidos, o recomiendan filtrar en servidor en vez de traer históricos completos).

### Conexión con olula_servidor
`client.py` envuelve `requests` (síncrono): `api_get/api_get_one/api_get_many/api_post/api_patch/api_put/api_delete` contra `{API_HOST}{path}`, desenvolviendo `{"datos": ...}` (formato de respuesta del backend). `build_query()` serializa `filtro`/`orden`/`paginacion` a un parámetro `q` en JSON — mismo formato que `criteriaQuery` del frontend.

**Auth en cascada** (`_headers()`): 1) `Authorization` del contexto MCP actual, 2) fallback al `ContextVar` del middleware, 3) si no hay usuario detrás, `API_KEY` de servicio (`Authorization: X-Api-Key <key>`). El MCP no transforma el JWT: lo reenvía tal cual — actúa como proxy de identidad, exactamente igual que hace el frontend con el mismo backend.

### Entorno y despliegue
`.env`: `API_HOST` (URL de `olula_servidor`), `API_KEY` (clave de servicio), `MCP_TRANSPORT` (`stdio`/`http`). Dev: `make setup && make run` (venv Python 3.12). Producción: `Dockerfile` (`python:3.12-slim`), expone puerto 8000, arranca `python main.py --transport http --host 0.0.0.0 --port 8000`.

### Patrones notables
- **Multi-tenant**: sin aislamiento en el MCP; `empresa_id` viaja como parámetro explícito en las tools de creación, el backend hace el scoping.
- **Sin estado**: cada tool es stateless; no hay Pydantic explícito, la validación de tipos la infiere fastmcp de los type hints de Python para generar el JSON schema de cada tool.
- **Errores**: sin manejo propio, se propagan excepciones de `requests`/`ValueError`, fastmcp las traduce a errores de tool.

---

## 4. Notas para trabajar en este ecosistema

- Si una feature necesita cambios de dominio, normalmente toca **dos repos**: `olula_servidor` (comando/consulta CQRS + endpoint) y `quimera-olula` (diseño/dominio/infraestructura/vistas). Si además debe ser accesible por agentes de IA, toca un tercero: añadir/ajustar la tool correspondiente en `olula_mcp/tools/<dominio>.py`.
- El **formato de filtro/orden/paginación** (`q` como JSON con `filtro`/`orden`/`paginacion`) es idéntico entre `criteriaQuery` (frontend) y `build_query` (MCP) porque ambos hablan con la misma API — útil como referencia cruzada si hay dudas de contrato.
- Los **nombres de app/cliente coinciden** entre frontend y backend (`sanhigia`, `dulce_bebe`, `nadia`, etc.) — al tocar un cliente concreto, revisar ambos repos con el mismo nombre de carpeta.
- El repo `olula_servidor` tiene su propio conjunto de subagentes y skills de Claude Code (`.claude/agents/`, `.claude/skills/specs-runner.md`) pensados para el flujo TDD/CQRS de ese lado — no confundir con los agentes/skills de este repo (`quimera-coder`, `specs-runner`, `inject-factory`, etc.), que son específicos de la arquitectura DDD del frontend.
