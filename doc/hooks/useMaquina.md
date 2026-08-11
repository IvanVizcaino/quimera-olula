# useMaquina

Implementación de máquina de estados finitos (FSM) para React. Es el patrón central de orquestación de flujos UI en Quimera.

Existen dos variantes activas: `useMaquina` (simple, estado externo) y `useMaquina4` (con contexto y reducer interno). Además se exporta `calcularEstado` para usar en tests unitarios.

---

## useMaquina — variante simple

### Descripción

Conecta una definición de máquina con un estado externo (normalmente el `estado` dentro de un contexto mayor). Cada evento recibido puede transicionar a otro estado o ejecutar una función asíncrona antes de hacerlo.

### Firma

```typescript
function useMaquina<Estado extends string>(
    maquina: Maquina<Estado>,
    estado: Estado,
    setEstado: (estado: Estado) => void
): ProcesarEvento
```

### Parámetros

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `maquina` | `Maquina<Estado>` | Definición de la máquina: mapa de estados → eventos → transiciones |
| `estado` | `Estado` | Estado actual |
| `setEstado` | `(e: Estado) => void` | Setter del estado |

### Tipos relacionados

```typescript
// Transición simple (string) o handler async
type OnEvento<E> = (payload?: unknown) => E | void | Promise<E | void>

// La máquina: para cada estado, un mapa de evento → transición o handler
type Maquina<E extends string> = Record<E, Record<string, E | OnEvento<E>>>

// Función que emite eventos a la máquina
type ProcesarEvento = (evento: string, payload?: unknown) => void
```

### Retorno

Devuelve una función `ProcesarEvento` para emitir eventos. Si el evento no existe en el estado actual, se ignora silenciosamente.

---

## useMaquina4 — variante con contexto

### Descripción

Variante más potente que gestiona internamente un par `{ estado, contexto }` mediante `useReducer`. Los handlers reciben y devuelven el contexto completo, lo que permite orquestar flujos con múltiples datos.

### Firma

```typescript
function useMaquina4<Estado extends string, Contexto extends ContextoBase>(
    opciones: {
        config: ConfigMaquina4<Estado, Contexto>,
        publicar?: ProcesarEvento
    }
): [ProcesarEvento, Maquina3<Estado, Contexto>]
```

### Tipos relacionados

```typescript
// Par estado + contexto
type Maquina3<Estado extends string, Contexto extends ContextoBase> = {
    estado: Estado,
    contexto: Contexto
}

// Configuración completa de la máquina con contexto
type ConfigMaquina4<E extends string, C extends ContextoBase> = {
    inicial: Maquina3<E, C>,         // Estado y contexto iniciales
    estados: Record<E, Record<string, E | OnEvento3<E, C>>>;
}

// Handler con acceso a máquina completa, payload y setEstado
type OnEvento3<E extends string, C extends ContextoBase> = ({
    maquina, payload, setEstado, publicar
}: ParamsOnEvento<E, C>) => Maquina3<E, C> | void;
```

### Retorno

Una tupla `[emitir, maquina3]`:
- `emitir` — función para enviar eventos
- `maquina3` — objeto `{ estado, contexto }` actual

---

## calcularEstado — función pura para tests

### Descripción

Calcula el siguiente estado dado un evento y payload. Es una función pura, sin React, ideal para tests unitarios de la lógica de transiciones.

### Firma

```typescript
function calcularEstado<Estado extends string>(
    maquina: ConfigMaquina5<Estado>,
    estado: Estado,
    evento: string,
    payload: unknown
): Estado
```

### Tipos

```typescript
type ConfigMaquina5<E extends string> = {
    estados: Record<E, Record<string, E | ((payload?: unknown) => E)>>;
}
```

---

## Cómo escribir una máquina

### Ejemplo mínimo (variante simple)

```typescript
// maquina.ts
type Estado = "INICIAL" | "CREANDO"

const maquina: Maquina<Estado> = {
    INICIAL: {
        crear_solicitado: "CREANDO",             // transición directa
        recargar_solicitado: recargarDesdeApi,   // handler async
    },
    CREANDO: {
        creacion_confirmada: "INICIAL",
        creacion_cancelada: "INICIAL",
    },
}
```

```tsx
// Componente
const [estado, setEstado] = useState<Estado>("INICIAL");
const emitir = useMaquina(maquina, estado, setEstado);

<QBoton onClick={() => emitir("crear_solicitado")}>Nuevo</QBoton>
```

### Ejemplo con contexto (variante 4)

```typescript
// Tipos
type EstadoModulo = "INICIAL" | "CARGADO" | "EDITANDO"
type ContextoModulo = { modulo: Modulo | null }

// Config
const config: ConfigMaquina4<EstadoModulo, ContextoModulo> = {
    inicial: { estado: "INICIAL", contexto: { modulo: null } },
    estados: {
        INICIAL: {
            id_cambiado: async ({ maquina, payload, setEstado }) => {
                const modulo = await getModulo(payload as string);
                return setEstado("CARGADO")({ ...maquina, contexto: { modulo } });
            },
        },
        CARGADO: {
            editar_solicitado: "EDITANDO",
        },
        EDITANDO: {
            guardar_confirmado: async ({ maquina, payload, setEstado, publicar }) => {
                await patchModulo(maquina.contexto.modulo!.id, payload as Modulo);
                publicar?.("modulo_cambiado", payload);
                return setEstado("CARGADO")(maquina);
            },
            edicion_cancelada: "CARGADO",
        },
    },
}

// En componente
const [emitir, { estado, contexto }] = useMaquina4({ config });
```

### Handler que publica eventos al padre

Un handler puede emitir eventos hacia afuera usando el `publicar` que recibe como parámetro (en `useMaquina4`) o que se inyecta externamente:

```typescript
// Handler en dominio del detalle
export const guardarModulo: ProcesarContexto = async ({ maquina, payload, setEstado, publicar }) => {
    const modulo = payload as Modulo;
    await patchModulo(modulo.id, modulo);
    publicar("modulo_cambiado", modulo);   // notifica al maestro
    return setEstado("CARGADO")(maquina);
};
```

---

## Buenas prácticas

- Los nombres de eventos deben ser **semánticos**: `presupuesto_creado`, no `ok` ni `submit`.
- Cada estado solo reacciona a los eventos que le corresponden. Eventos en estados incorrectos se ignoran.
- La lógica de negocio va en **funciones del dominio** (`dominio.ts`), no inline en la máquina.
- La máquina **orquesta** (qué pasa y en qué orden), el dominio **ejecuta** (cómo).
- Usar `calcularEstado` para testear las transiciones sin necesidad de render.

---

## Tests de máquina

```typescript
// test/maquina.test.ts
import { calcularEstado } from "@olula/lib/useMaquina.ts";
import { config } from "../maquina.ts";

describe("transiciones", () => {
    test("desde INICIAL, crear_solicitado pasa a CREANDO", () => {
        const siguiente = calcularEstado(config, "INICIAL", "crear_solicitado", undefined);
        expect(siguiente).toBe("CREANDO");
    });

    test("evento desconocido no cambia el estado", () => {
        const siguiente = calcularEstado(config, "INICIAL", "evento_inexistente", undefined);
        expect(siguiente).toBe("INICIAL");
    });
});
```
