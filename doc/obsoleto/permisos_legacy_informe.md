# Informe de permisos en legacy

## 1. Flujo real de permisos en runtime

### 1. Bootstrap del proyecto

- La app carga un objeto `project` con dependencias de extensiones en [legacy/apps/sanhigia/src/project.ts](../legacy/apps/sanhigia/src/project.ts#L11).
- Ese `project` se monta en `Quimera.App` en [legacy/libs/core/components/App/App.jsx](../legacy/libs/core/components/App/App.jsx#L39).

### 2. Agregación central de `rules` y menús

- `loadProject` junta `rules` de todas las extensiones en [legacy/libs/core/hooks/useManager.jsx](../legacy/libs/core/hooks/useManager.jsx#L79).
- `getRules` hace merge plano de todos los bloques `rules` en [legacy/libs/core/hooks/useManager.jsx](../legacy/libs/core/hooks/useManager.jsx#L259).
- `getMenus` hace merge de `appmenu` y `usermenu` en [legacy/libs/core/hooks/useManager.jsx](../legacy/libs/core/hooks/useManager.jsx#L268).

### 3. Resolución de permisos: motor ACL

- `ACL.can` está implementado en [legacy/libs/core/lib/ACL.js](../legacy/libs/core/lib/ACL.js#L89).
- Si el usuario es `superuser`, devuelve `true` directamente en [legacy/libs/core/lib/ACL.js](../legacy/libs/core/lib/ACL.js#L85).
- Si una `rule` definida en `index` es una función, la evalúa pasando `check(...)` en [legacy/libs/core/lib/ACL.js](../legacy/libs/core/lib/ACL.js#L80).
- `check(...)` lee `util.getUser().acl` y valida por jerarquía: método -> modelo -> grupo -> `global_access` en [legacy/libs/core/lib/ACL.js](../legacy/libs/core/lib/ACL.js#L20).
- Si una `rule` no existe en el mapa de `rules`, actualmente termina permitiendo (`true`) en [legacy/libs/core/lib/ACL.js](../legacy/libs/core/lib/ACL.js#L108).

### 4. Dónde se aplica

- Menú: `AppMenu` envuelve items con `Can rule=...` en [legacy/libs/comps/AppMenu/AppMenu.jsx](../legacy/libs/comps/AppMenu/AppMenu.jsx#L255).
- Componente `Can`: evalúa `ACL.can(rule)` y renderiza si alguna regla pasa en [legacy/libs/comps/Can/Can.js](../legacy/libs/comps/Can/Can.js#L3).
- Rutas: `Container` protege por convención `view:visit` con `ACL.can(view + ":visit")` en [legacy/extensions/core/views/Container/Container.ui.jsx](../legacy/extensions/core/views/Container/Container.ui.jsx#L18).

### 5. Cuándo se recalculan los menús

- Al autenticarse o cambiar estado, se dispara `updateMenus` y se vuelve a calcular `getMenus` en [legacy/extensions/core/views/Global/Global.ctrl.js](../legacy/extensions/core/views/Global/Global.ctrl.js#L53) y [legacy/extensions/core/views/Container/Container.ui.jsx](../legacy/extensions/core/views/Container/Container.ui.jsx#L41).

## 2. Ficheros gestores implicados

### Núcleo del sistema

- [legacy/libs/core/lib/ACL.js](../legacy/libs/core/lib/ACL.js#L1)
- [legacy/libs/core/hooks/useManager.jsx](../legacy/libs/core/hooks/useManager.jsx#L50)
- [legacy/libs/comps/Can/Can.js](../legacy/libs/comps/Can/Can.js#L1)
- [legacy/libs/comps/AppMenu/AppMenu.jsx](../legacy/libs/comps/AppMenu/AppMenu.jsx#L149)
- [legacy/extensions/core/views/Container/Container.ui.jsx](../legacy/extensions/core/views/Container/Container.ui.jsx#L1)
- [legacy/extensions/core/views/Global/Global.ctrl.js](../legacy/extensions/core/views/Global/Global.ctrl.js#L1)

### Autenticación y datos de permisos

- [legacy/extensions/login/views/Login/Login.ctrl.js](../legacy/extensions/login/views/Login/Login.ctrl.js#L25)
- [legacy/extensions/login/static/schemas.js](../legacy/extensions/login/static/schemas.js#L1) para `flrules` y `flpermissions`
- [legacy/extensions/login/views/Groups/Groups.ctrl.js](../legacy/extensions/login/views/Groups/Groups.ctrl.js#L252)
- [legacy/extensions/login/comps/AccessRule.jsx](../legacy/extensions/login/comps/AccessRule.jsx#L77)
- [legacy/libs/core/util.js](../legacy/libs/core/util.js#L704) para `setUser` y `getUser`, que usa ACL

### Definición de reglas por extensión

- [legacy/extensions/sanhigia/smartsales/index.ts](../legacy/extensions/sanhigia/smartsales/index.ts#L272)
- [legacy/extensions/monterelax/erp/index.ts](../legacy/extensions/monterelax/erp/index.ts#L140)
- [legacy/extensions/vbarba/facturacion/index.ts](../legacy/extensions/vbarba/facturacion/index.ts#L78)
- [legacy/extensions/base/almacen/index.ts](../legacy/extensions/base/almacen/index.ts#L34)
- [legacy/extensions/login/index.ts](../legacy/extensions/login/index.ts#L58)
- El mismo patrón se repite en otras extensiones legacy.

### Definición de visibilidad en menú

- [legacy/extensions/sanhigia/smartsales/static/appmenu.js](../legacy/extensions/sanhigia/smartsales/static/appmenu.js#L1)
- Y los `appmenu` y `usermenu` equivalentes del resto de extensiones.

## 3. Cómo encaja el caso de smartsales

### Rule alias definida en `index`

En [legacy/extensions/sanhigia/smartsales/index.ts](../legacy/extensions/sanhigia/smartsales/index.ts#L287):

- `contactos:revisar_contacto` -> `check("contactos/revisar_contacto")`

### Uso en menú

- [legacy/extensions/sanhigia/smartsales/static/appmenu.js](../legacy/extensions/sanhigia/smartsales/static/appmenu.js#L8)

### Uso en UI

- [legacy/extensions/sanhigia/smartsales/views/Contacto/Contacto.ui.jsx](../legacy/extensions/sanhigia/smartsales/views/Contacto/Contacto.ui.jsx#L132)

## 4. Pasos propuestos para llevarlo a apps no legacy

1. Mantener dos capas de permisos:
   - reglas funcionales de UI, por ejemplo `Dashboard:visit` o `contactos:revisar_contacto`
   - permisos técnicos de backend, por ejemplo `contactos/revisar_contacto` o `ss_campanias.get`
2. Crear un servicio ACL único en no legacy.
3. Registrar reglas por módulo, equivalente al `index.rules` actual.
4. Integrar guardas en:
   - menús
   - rutas
   - componentes tipo `Can`
5. Si queréis administración editable, modelar el equivalente a `flrules` y `flpermissions`.
6. Añadir tests de precedencia, superusuario, reglas no definidas y combinaciones.

## 5. Sobre el replace `contactos/revisar_contacto` -> `crm.contacto.revisar_contacto`

Sí, es factible, pero no conviene hacerlo con un replace ciego.

### Motivo técnico

- El parser actual de ACL en [legacy/libs/core/lib/ACL.js](../legacy/libs/core/lib/ACL.js#L24) trata tokens con `.` y con `/` de forma distinta.
- Un token de tres segmentos con punto, por ejemplo `crm.contacto.revisar_contacto`, hoy se interpretaría como:
  - modelo = `crm`
  - verbo = `contacto`
  - acción = `revisar_contacto`
- Eso no equivale al esquema actual, donde el modelo real suele ser `contactos` y la acción `revisar_contacto`.
- Además, `AccessRule` clasifica acciones usando `split("/")` en [legacy/extensions/login/comps/AccessRule.jsx](../legacy/extensions/login/comps/AccessRule.jsx#L77), así que también hay impacto en el gestor de permisos.

### Recomendación de migración segura

1. Introducir una función de normalización de token para compatibilidad.
2. Aceptar el formato nuevo, pero traducir internamente al antiguo durante transición.
3. Migrar reglas funcionales y menús gradualmente.
4. Migrar catálogo de reglas y valores en backend.
5. Retirar compatibilidad antigua cuando todo esté migrado.

### Conclusión

Sí es viable y probablemente una buena dirección, pero requiere una capa de compatibilidad y una migración por fases. No haría un `find/replace` directo sobre legacy ni sobre el futuro ACL sin adaptar antes el parser y el catálogo de reglas.
