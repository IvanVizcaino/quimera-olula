---
name: inject-factory
description: |
  Refactoriza partes de packages/contextos para hacerlas inyectables vía el sistema de factory/DI,
  y opcionalmente crea la implementación personalizada en una o más apps.
  Conoce la arquitectura DDD de 4 ficheros, las plantillas canónicas, el patrón FactoryObj/FactoryCtx,
  las convenciones de naming de slots, y cómo las apps extienden las factories base.

  <example>
  user: "/inject-factory tpv/venta botón nueva venta -> dulce_bebe (pedir agente con AgenteTpv)"
  assistant: Extrae el botón a componente inyectable, registra slot en factory, crea override en dulce_bebe.
  </example>

  <example>
  user: "haz inyectable el detalle del pedido para que naranjas_jimenez pueda personalizarlo"
  assistant: Envuelve DetallePedido con resolución factory, registra slot, crea override en naranjas_jimenez.
  </example>

  <example>
  user: "/inject-factory ventas/factura infraestructura postLinea -> cabrera"
  assistant: Registra postLinea como slot en factory de ventas, crea override de infraestructura en cabrera.
  </example>
---

# Inject Factory — Quimera Olula

Refactorizas componentes, funciones de infraestructura o lógica de negocio de `packages/contextos/` para hacerlos inyectables vía el sistema de factory/DI, y opcionalmente creas la implementación personalizada en una o más apps.

Leer [references/factory-patterns.md](references/factory-patterns.md) antes de empezar. Contiene: sistema FactoryObj/FactoryCtx, convenciones de naming de slots, patrones de resolución, y ejemplos reales de cada tipo de override.

## Entrada esperada

El usuario indica:
1. **Qué** hacer inyectable: un componente, función de infraestructura, metatabla, función de dominio, etc.
2. **Dónde** vive actualmente: ruta del módulo en `packages/contextos/src/`
3. **Para qué app(s)**: nombre de la app en `apps/` que necesita el override (opcional)
4. **Qué personalización**: descripción del comportamiento custom (opcional)

## Paso 0 — Explorar antes de modificar

1. Lee el fichero que contiene el elemento a hacer inyectable.
2. Lee la factory base del contexto (`packages/contextos/src/<contexto>/factory.ts`).
3. Si se indica app destino, lee su `factory.ts` y busca si ya tiene factory para ese contexto.
4. Lee las plantillas canónicas si el módulo tiene estructura de plantilla.

## Paso 1 — Clasificar el tipo de inyección

| Tipo | Qué se inyecta | Slot naming | Resolución |
|------|----------------|-------------|------------|
| **Componente** | Un componente React (botón, detalle, lista, modal) | `{modulo}_{ubicacion}_{Componente}` | `FactoryObj.app.{Ctx}?.{slot} as typeof Base \|\| Base` |
| **Infraestructura** | Función CRUD o mapper (postXxx, xxxDesdeApi) | `{modulo}_infraestructura` (objeto) o `{modulo}_{funcion}` | `FactoryObj.app.{Ctx}?.{slot} ?? fallbackBase` |
| **Meta** | MetaModelo o MetaTabla | `meta{Modulo}` o `metaTabla{Modulo}` | `FactoryObj.app.{Ctx}?.{slot} ?? metaBase` |
| **Función de dominio** | Función pura de negocio o ProcesarContexto | `{modulo}_{funcion}` | `FactoryObj.app.{Ctx}?.{slot} ?? fnBase` |
| **Valor de configuración** | String, booleano, o constante | `{modulo}_{config}` | `FactoryObj.app.{Ctx}?.{slot} ?? defaultValue` |

## Paso 2 — Refactorizar en packages (hacer inyectable)

### 2.1 Para componentes

1. **Exportar componente Base** — Si el componente está inline (ej. JSX dentro de un render), extraerlo a un componente con nombre `{Nombre}Base` y exportarlo:
   ```typescript
   export type MiComponenteProps = { emitir: EmitirEvento; /* ... */ };
   export const MiComponenteBase = ({ emitir }: MiComponenteProps) => ( /* ... */ );
   ```

2. **Resolver vía factory en el punto de uso** — En el lugar donde se renderizaba el componente inline, resolverlo desde factory con fallback:
   ```typescript
   import { FactoryObj } from "@olula/lib/factory_ctx.tsx";

   // Dentro del render:
   const MiComponente_ = (FactoryObj.app.{Ctx}?.{slot} as typeof MiComponenteBase) ?? MiComponenteBase;
   return <MiComponente_ emitir={emitir} />;
   ```

   **Alternativa con useContext** (si se necesita reactividad al cambio de factory):
   ```typescript
   const { app } = useContext(FactoryCtx);
   const MiComponente_ = (app.{Ctx}?.{slot} as typeof MiComponenteBase) ?? MiComponenteBase;
   ```

   Preferir `FactoryObj.app` (acceso directo) sobre `useContext(FactoryCtx)` cuando el componente ya tiene acceso al contexto o cuando la factory no cambia tras el mount.

3. **Registrar en factory base** del contexto:
   ```typescript
   // packages/contextos/src/<contexto>/factory.ts
   import { MiComponenteBase } from "./path/MiComponente.tsx";

   export class Factory{Ctx}Olula {
       static {slot} = MiComponenteBase
   }
   ```

### 2.2 Para funciones de infraestructura

1. **Exportar la función base** (normalmente ya lo está).

2. **Resolver en el punto de uso** con fallback:
   ```typescript
   const fn = (FactoryObj.app.{Ctx}?.{slot} as typeof fnBase) ?? fnBase;
   const resultado = await fn(args);
   ```

   **Para objetos de infraestructura agrupados:**
   ```typescript
   interface MiInfra { fn1: Fn1Type; fn2: Fn2Type; }
   const getInfra = (): MiInfra => FactoryObj.app.{Ctx}?.{slot} as MiInfra;

   const fn1: Fn1Type = (args) => {
       const infra = getInfra();
       return (infra?.fn1 ?? fn1Base)(args);
   };
   ```

3. **Registrar en factory base**.

### 2.3 Para funciones ProcesarContexto (eventos de máquina)

1. Si el evento apunta a una función `ProcesarContexto`, resolver desde factory en `getMaquina()`:
   ```typescript
   export const getMaquina = () => {
       const miFn = (FactoryObj.app.{Ctx}?.{slot} as typeof miFnBase) ?? miFnBase;
       return {
           INICIAL: {
               mi_evento: miFn,
           }
       };
   };
   ```

2. Si la función necesita recibir datos extra vía payload, asegurarse de que acepta y propaga el payload:
   ```typescript
   export const miFn: ProcesarMaestro = async (contexto, payload) => {
       const datos = payload as { campo?: string } | undefined;
       await postAlgo(datos?.campo);
       // ...
   };
   ```

## Paso 3 — Crear override en la app destino (si se indica)

### 3.1 Estructura de ficheros en la app

```
apps/{app}/src/
├── contextos/
│   └── {contexto}/
│       ├── factory.ts                    # Factory específica de la app
│       └── {modulo}/
│           └── {operacion}/
│               └── MiComponente.tsx      # Componente custom
└── factory.ts                            # Factory raíz de la app
```

### 3.2 Factory del contexto en la app

```typescript
// apps/{app}/src/contextos/{contexto}/factory.ts
import { Factory{Ctx}Olula } from '#/{contexto}/factory.ts';
import { MiComponenteCustom } from './{modulo}/{operacion}/MiComponente.tsx';

export class Factory{Ctx}{App} extends Factory{Ctx}Olula {
    static override {slot} = MiComponenteCustom
}
```

**Importante:** Usar `extends` para heredar todos los slots base y solo sobreescribir los necesarios.

### 3.3 Factory raíz de la app

Si la app ya tiene factory para el contexto, solo cambiar el import. Si no, añadir la nueva factory:

```typescript
// apps/{app}/src/factory.ts
import { Factory{Ctx}{App} } from './contextos/{contexto}/factory.ts';

export class Factory{App} {
    {Ctx} = Factory{Ctx}{App};   // Antes: Factory{Ctx}Olula
}
```

### 3.4 Componente custom

El componente custom recibe las mismas props que el Base. Puede:
- Añadir UI extra (modales, selectores, pasos previos)
- Llamar a funciones de infraestructura con parámetros extra
- Emitir los mismos eventos que el base con payload enriquecido

## Paso 4 — Verificación

1. Ejecutar `pnpm type-check` — debe pasar en todos los packages y apps.
2. Ejecutar `pnpm lint` — debe pasar sin errores nuevos.
3. Verificar que la app base (olula) sigue funcionando igual (el fallback al Base debe ser transparente).
4. Si hay tests relevantes, ejecutarlos.

## Reglas importantes

1. **No romper la interfaz existente** — El componente/función base debe seguir funcionando exactamente igual cuando no hay override.
2. **Misma interfaz de props** — El componente custom debe aceptar las mismas props que el Base (puede ignorar algunas internamente).
3. **Naming consistente** — Seguir la convención `{modulo}_{ubicacion}_{Componente}` para slots.
4. **Un slot por concepto** — No crear múltiples slots para variantes del mismo concepto. Un solo slot con el componente que decide internamente.
5. **Factory base siempre tiene el default** — `static {slot} = ComponenteBase` en la factory de packages/contextos.
6. **extends, no rewrite** — Las factory de apps extienden la base con `extends`, no la reimplementan desde cero.
7. **Imports de packages** — En el componente custom de la app, usar `#/` para importar de packages/contextos y `@olula/lib` / `@olula/componentes` para los otros packages.
