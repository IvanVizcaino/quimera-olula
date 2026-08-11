# Factory/DI Patterns — Quimera Olula

## Sistema core

### FactoryObj (singleton global)

```typescript
// packages/lib/src/factory_ctx.tsx
export const FactoryObj = {
  app: {} as Record<string, Record<string, unknown>>,  // APP[Contexto][Slot]
  setApp: (_app: APP) => {},
  menu: [] as ElementoMenu[],
  setMenu: (_menu: Menu) => {},
};

export const FactoryCtx = createContext(FactoryObj);   // React context
export const FactoryProvider = ({ children }) => { ... };
```

- `FactoryObj.app` se accede directamente (fuera de React o cuando no se necesita reactividad)
- `useContext(FactoryCtx)` se usa dentro de componentes React cuando se necesita reactividad

### Inicialización en app (main.tsx)

```typescript
import { FactoryObj, FactoryProvider } from "@olula/lib/factory_ctx.tsx";

const factory = new FactoryApp();
const appFactory = factory as unknown as Record<string, Record<string, unknown>>;

const App = () => {
  useEffect(() => {
    FactoryObj.setApp(appFactory);
    FactoryObj.setMenu(crearMenu(factory));
  }, []);
  return <RouterProvider router={rutas} />;
};

root.render(
  <StrictMode>
    <FactoryProvider><App /></FactoryProvider>
  </StrictMode>
);
```

## Jerarquía de factories

### Factory raíz de app

```typescript
// apps/{app}/src/factory.ts
export class FactoryApp {
    Auth = FactoryAuthOlula;         // contexto Auth
    Ventas = FactoryVentasOlula;     // contexto Ventas
    TPV = FactoryTpvOlula;           // contexto TPV
    Almacen = FactoryAlmacenOlula;   // contexto Almacen
    Componentes = FactoryComponentes; // componentes UI
}
```

Cada propiedad es una clase con slots estáticos. El nombre de la propiedad (`Auth`, `Ventas`, `TPV`, etc.) es la clave en `FactoryObj.app`.

### Factory base de contexto

```typescript
// packages/contextos/src/ventas/factory.ts
export class FactoryVentasOlula {
    static pedido_DetallePedido = DetallePedidoBase
    static pedido_detalle_lineas_LineasLista = LineasListaBase
    static pedido_CrearLinea = CrearLineaBase
    static pedido_infraestructura = ventasPedidoInfra
    static api_payloadPatchPedido = payloadPatchPedido
    static metaTablaPedido = getMetaTablaPedido
    static metaPedido = metaPedido
    static menu = menuVentas
}
```

### Factory app que extiende la base

```typescript
// apps/naranjas_jimenez/src/contextos/ventas/factory.ts
import { FactoryVentasOlula } from '#/ventas/factory.ts';

export class FactoryVentasNrj extends FactoryVentasOlula {
    static override pedido_DetallePedido = DetallePedidoNrj
    static override pedido_detalle_lineas_LineasLista = LineasListaNrj
    static override pedido_infraestructura = ventasPedidoInfraNrj
}
```

## Convención de naming de slots

```
{modulo}_{ubicacion}_{Componente}
```

Ejemplos reales del proyecto:

| Slot | Tipo | Contexto |
|------|------|----------|
| `pedido_DetallePedido` | Componente | Ventas |
| `pedido_detalle_lineas_LineasLista` | Componente | Ventas |
| `pedido_CrearLinea` | Componente | Ventas |
| `pedido_EditarLinea` | Componente | Ventas |
| `pedido_infraestructura` | Objeto infra | Ventas |
| `api_payloadPatchPedido` | Función | Ventas |
| `metaTablaPedido` | Función | Ventas |
| `metaPedido` | MetaModelo | Ventas |
| `venta_BotonNuevaVenta` | Componente | TPV |
| `formato_login` | String config | Auth |
| `cabecera` | Componente | Componentes |
| `cabecera_logo` | Componente | Componentes |
| `cabecera_menu_usuario` | Componente | Componentes |
| `menu` | Array config | Todos |

## Patrones de resolución

### Patrón 1: Componente wrapper con fallback

```typescript
// packages/contextos/src/ventas/pedido/detalle/DetallePedido.tsx
export const DetallePedido = (props: DetallePedidoProps) => {
  const { app } = useContext(FactoryCtx);
  if (!app.Ventas) return null;

  const DetallePedido_ = app.Ventas.pedido_DetallePedido as typeof DetallePedidoBase;
  return <DetallePedido_ {...props} />;
};

// Implementación base en el mismo fichero o exportada aparte
export const DetallePedidoBase = (props: DetallePedidoProps) => {
  // ... implementación real
};
```

### Patrón 2: Resolución inline en render

```typescript
// Dentro de un componente, en el render:
const BotonNuevaVenta_ = (FactoryObj.app.TPV?.venta_BotonNuevaVenta as typeof BotonNuevaVentaBase)
    ?? BotonNuevaVentaBase;
return <BotonNuevaVenta_ emitir={emitir} />;
```

### Patrón 3: Función de infraestructura con override

```typescript
// packages/contextos/src/ventas/pedido/infraestructura.ts
export interface VentasPedidoInfra {
    linea_desde_api: LineaPedidoDesdeApi;
    postLinea: PostLinea;
}

const getInfra = (): VentasPedidoInfra =>
    FactoryObj.app.Ventas?.pedido_infraestructura as VentasPedidoInfra;

// Cada función se resuelve individualmente con fallback
const lineaPedidoDesdeApi: LineaPedidoDesdeApi = (l) => {
    const infra = getInfra();
    return (infra?.linea_desde_api ?? lineaPedidoDesdeApiBase)(l);
};
```

### Patrón 4: Función ProcesarContexto en máquina

```typescript
// packages/contextos/src/tpv/venta/maestro/maquina.ts
export const getMaquina = () => {
    const crearVenta_ = (FactoryObj.app.TPV?.venta_crearVenta as typeof crearVentaBase)
        ?? crearVentaBase;
    return {
        INICIAL: {
            creacion_de_venta_solicitada: crearVenta_,
        }
    };
};
```

### Patrón 5: Valor de configuración

```typescript
// packages/contextos/src/auth/login/vistas/Login.tsx
const { app } = useContext(FactoryCtx);
const formatoLogin = (app.Auth?.formato_login as string) ?? "email";
const label = formatoLogin === "email" ? "Email" : "Usuario";
```

## Estructura de override en apps

```
apps/{app}/src/
├── factory.ts                              # Factory raíz
├── contextos/
│   ├── ventas/
│   │   ├── factory.ts                      # FactoryVentas{App} extends FactoryVentasOlula
│   │   └── pedido/
│   │       ├── detalle/
│   │       │   └── DetallePedido.tsx        # Componente custom
│   │       ├── crear_linea/
│   │       │   └── CrearLinea.tsx           # Modal custom
│   │       └── infraestructura.ts           # Mappers custom
│   └── tpv/
│       ├── factory.ts                      # FactoryTpv{App} extends FactoryTpvOlula
│       └── venta/
│           └── crear_venta/
│               └── CrearVenta.tsx           # Componente custom
└── componentes/
    └── CabeceraCustom.tsx                  # Override de componentes UI
```

## Factories base existentes

| Factory | Fichero | Contexto |
|---------|---------|----------|
| `FactoryTpvOlula` | `packages/contextos/src/tpv/factory.ts` | TPV |
| `FactoryVentasOlula` | `packages/contextos/src/ventas/factory.ts` | Ventas |
| `FactoryAlmacenOlula` | `packages/contextos/src/almacen/factory.ts` | Almacen |
| `FactoryAuthOlula` | `packages/contextos/src/auth/factory.ts` | Auth |
| `FactoryComponentesOlula` | `packages/componentes/src/factory.ts` | Componentes |

## Apps con factories custom

| App | Fichero factory raíz | Contextos con override |
|-----|---------------------|----------------------|
| `naranjas_jimenez` | `apps/naranjas_jimenez/src/factory.ts` | Ventas |
| `dulce_bebe` | `apps/dulce_bebe/src/factory.ts` | TPV |
| `crema_cafe` | `apps/crema_cafe/src/factory.ts` | Ventas |
| `cabrera` | `apps/cabrera/src/factory.ts` | Componentes |
| `guanabana` | `apps/guanabana/src/factory.ts` | Componentes |

## Imports en apps

- `#/` apunta a `packages/contextos/src/` (para importar factories base, tipos, componentes base)
- `@olula/lib/` apunta a `packages/lib/src/` (para FactoryObj, FactoryCtx, tipos comunes)
- `@olula/componentes/` apunta a `packages/componentes/src/` (para QModal, QBoton, etc.)
- Imports locales con `./` para ficheros dentro de la propia app
