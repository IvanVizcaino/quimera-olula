# Prompt
Queremos crear un componente Home que se cargue en la pantalla principal de inicio. Este coponente cargará una serie de widgets que cada App tendrá definidos. Para cada widget se coprobará un regla de acceso para saber si podemos o no mostrarlo (como se hace por ejemplo en los menús).

El widget no recibirá parámetros. En función del usuario conectado y sus permisos mostrará su contenido.

Ejemplo de widget: CRM - Previsión de oportunidades.
El widget hace un get a /crm/oportunidad_venta con el filtro de no en (ganadas, perdidas) y con todas las oportunidades, su importe y probabilidad, muestra un texto estilizado de "Previsión de ventas potencial X.XXX€". Muestra también un botón o enlace "Ver" que nos hace navegar a oportunidades de venta en modo kanban, con el mismo filtro que se ha usado para hacer el get inicial.
Si no hay ninguna oportunidad abierta, muestra un texto de "No tienes oportunidades abiertas".


Posible ampliación de Home / Widgets: Los widgets pueden pertenecer a un catálogo en el que el usuario pueda escoger y posicionar (drag and drop) widgets en su dashboard. El dashboard puede estar en ordenador o móvil, con lo que habría que seguir algún método de desborde u ordenación por columnas que lo haga responsive. Además, cada widget puede tener parámetos e incluirse varias veces en el mismo dashboard con distintos parámetros. Por ejemplo, podemos tener un widget de recibos que diga "Tienes N recibos {ESTADO}" y cambiar los criterios de filtrado para los recibos para que se pueda usar como "Tienes N recibos pendientes" Y "Tienes N recibos vencidos"

Propón un plan y lo documentaremos en doc/arquitectura/specs_dashboard.md si lo aprobamos

# Specs: Sistema Home con Widgets

## Contexto

Actualmente la ruta `/` muestra `FondoInicio` (logo estático). Se sustituye por un **Home** real que carga widgets útiles para el usuario: cada widget es un componente React autosuficiente (sin props) que obtiene sus propios datos, evalúa la sesión del usuario, y se muestra u oculta en función de una regla de acceso (igual que los menús).

El objetivo es un sistema escalable donde cada módulo/contexto declara sus widgets (como ya declara su menú) y la App los agrega automáticamente.

---

## Diseño: patrón mirror de menús

El sistema de menús usa:
1. `packages/lib/src/menu.ts` — define `MenuContextFactory` y `crearMenu()`
2. Cada context factory tiene `static menu = menuX`
3. `FactoryObj.setMenu()` y `FactoryCtx` exponen el menú globalmente
4. Los componentes de menú filtran con `puede(regla)`

Los widgets siguen exactamente el mismo patrón.

---

## Ficheros a crear / modificar

### 1. `packages/lib/src/widgets.ts` (NUEVO)

```typescript
import { ComponentType } from "react";

export interface DefinicionWidget {
    id: string;        // identificador único, ej: "crm.widget.prevision_oportunidades"
    regla?: string;    // regla de acceso, ej: "crm.oportunidadventa.leer"
    Componente: ComponentType;
}

export type WidgetContextFactory = { widgets?: DefinicionWidget[] };

export const crearWidgets = (
    factory: Record<string, WidgetContextFactory>
): DefinicionWidget[] => {
    const factorias = Object.values(factory);
    return factorias
        .map(v => (v as WidgetContextFactory)?.widgets)
        .filter(Boolean)
        .flat() as DefinicionWidget[];
};
```

### 2. `packages/lib/src/factory_ctx.tsx` (MODIFICAR)

Añadir `widgets` y `setWidgets` al `FactoryObj` y al `FactoryProvider`, igual que se hace con `menu`.

```typescript
import { DefinicionWidget } from "@olula/lib/widgets.ts";

// En FactoryObj:
widgets: [] as DefinicionWidget[],
setWidgets: (_widgets: DefinicionWidget[]) => {},

// En FactoryProvider:
const [widgets, setWidgets] = useState<DefinicionWidget[]>([]);
// Asignar y exponer en el Provider value
```

### 3. `packages/componentes/src/home/Home.tsx` (NUEVO)

```typescript
import { useContext } from "react";
import { FactoryCtx } from "@olula/lib/factory_ctx.tsx";
import { puede } from "@olula/lib/dominio.ts";
import "./home.css";

export const Home = () => {
    const { widgets } = useContext(FactoryCtx);
    const visibles = widgets.filter(w => !w.regla || puede(w.regla));

    return (
        <div className="home-grid">
            {visibles.map(({ id, Componente }) => (
                <div key={id} className="home-widget">
                    <Componente />
                </div>
            ))}
        </div>
    );
};
```

### 4. `packages/componentes/src/home/home.css` (NUEVO)

Grid CSS responsive con columnas auto-fill de mínimo ~320px.

```css
.home-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: var(--espaciado-m);
    padding: var(--espaciado-m);
    align-content: start;
}

.home-widget {
    background: var(--color-fondo-elevado);
    border-radius: var(--radio-m);
    padding: var(--espaciado-m);
    border: var(--tamaño-borde-s) solid var(--color-borde-sutil);
}
```

### 5. `packages/componentes/src/index.ts` (MODIFICAR)

Exportar `Home`.

### 6. `packages/contextos/src/crm/oportunidadventa/widgets/WidgetPrevisionOportunidades.tsx` (NUEVO)

**Comportamiento:**
- Llama a `getOportunidadesVenta()` excluyendo estados terminales (ganada / perdida).
  - Estrategia: primero obtener `getEstadosOportunidadVenta()` para identificar los estados con `probabilidad === 100` (ganada) y `probabilidad === 0` (perdida). Construir el filtro dinámicamente excluyendo esos IDs.
- Calcula previsión: `sum(importe * probabilidad / 100)` sobre las oportunidades abiertas.
- **Con datos**: muestra texto estilizado "Previsión de ventas potencial **X.XXX€**" + enlace "Ver" a `/crm/oportunidadventa` con el mismo filtro codificado en la URL.
- **Sin datos**: muestra "No tienes oportunidades abiertas".
- **Cargando**: indicador de carga mientras se espera la respuesta.

El enlace "Ver" navega al maestro de oportunidades. Cuando se implemente la vista kanban, se puede añadir el parámetro `?modo=kanban`.

### 7. `packages/contextos/src/crm/widgets.ts` (NUEVO)

```typescript
import { DefinicionWidget } from "@olula/lib/widgets.ts";
import { WidgetPrevisionOportunidades } from "./oportunidadventa/widgets/WidgetPrevisionOportunidades.tsx";

export const widgetsCrm: DefinicionWidget[] = [
    {
        id: "crm.widget.prevision_oportunidades",
        regla: "crm.oportunidadventa.leer",
        Componente: WidgetPrevisionOportunidades,
    },
];
```

### 8. `packages/contextos/src/crm/factory.ts` (MODIFICAR)

```typescript
import { menuCrm } from "./menu.ts";
import { widgetsCrm } from "./widgets.ts";

export class FactoryCrmOlula {
    static menu = menuCrm;
    static widgets = widgetsCrm;
}
```

### 9. `apps/olula/src/router_factory.ts` (MODIFICAR)

Sustituir `FondoInicio` por `Home` en la ruta raíz:

```typescript
import { Home } from "@olula/componentes/home/Home.tsx";
// ...
Inicio = { router: { "": Home } };
```

### 10. `apps/olula/src/main.tsx` (MODIFICAR)

Añadir la llamada a `crearWidgets()` junto a `crearMenu()`:

```typescript
import { crearWidgets, WidgetContextFactory } from "@olula/lib/widgets.ts";

// En el useEffect:
FactoryObj.setWidgets(
    crearWidgets(new FactoryOlula() as unknown as Record<string, WidgetContextFactory>)
);
```

---

## Flujo completo

```
Login → whoAmI → permisos en localStorage
    ↓
main.tsx: crearWidgets(new FactoryOlula()) → FactoryObj.setWidgets([...])
    ↓
Usuario navega a "/"
    ↓
Home renderiza
    ↓
Por cada widget: !regla || puede(regla)  →  si true, renderiza <Componente />
    ↓
WidgetPrevisionOportunidades:
  1. getEstadosOportunidadVenta() — identificar IDs de estados terminales
  2. getOportunidadesVenta(filtroAbiertos, {}, paginacion)
  3. Calcula sum(importe * probabilidad / 100)
  4. Muestra "Previsión X.XXX€" + enlace "Ver"  |  "No tienes oportunidades abiertas"
```

---

## Posible ampliación (documentada, no implementada en Fase 1)

- **Catálogo de widgets**: el usuario elige qué widgets mostrar. Requiere persistencia (API o localStorage).
- **Drag-and-drop de posición**: añadir `@dnd-kit/core` + `@dnd-kit/sortable` (ya valorado para kanban). Guardar orden por usuario.
- **Layout responsive multi-columna**: ya cubierto por CSS Grid `auto-fill`.
- **Widgets parametrizables**: añadir campo `parametros?: Record<string, unknown>` a `DefinicionWidget`. El mismo widget puede registrarse varias veces con distintos parámetros (ej: widget de recibos "pendientes" y "vencidos").

---

## Verificación

1. Ejecutar la app: `pnpm run --filter @olula/olula dev`
2. Login → ruta `/` debe mostrar el Home con widgets.
3. Con un usuario que tenga `crm.oportunidadventa.leer`: debe aparecer el widget de previsión.
4. Con un usuario sin ese permiso: el widget no aparece.
5. Con oportunidades abiertas en el sistema: muestra la previsión y el enlace "Ver".
6. Sin oportunidades abiertas: muestra "No tienes oportunidades abiertas".
7. TypeScript: `pnpm type-check`
