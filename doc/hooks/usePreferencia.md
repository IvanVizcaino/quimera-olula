# usePreferencia

Persiste una preferencia de UI en `localStorage` y la expone como estado React reactivo. Todas las preferencias se almacenan bajo la clave `"quimera-preferencias"` como un único objeto JSON, evitando colisiones con otras claves del sistema.

---

## Firma

```typescript
function usePreferencia<T>(clave: string, porDefecto: T): [T, (v: T) => void]
```

### Parámetros

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `clave` | `string` | Identificador de la preferencia. Usa la convención `"dominio.modulo.nombre"` |
| `porDefecto` | `T` | Valor inicial si la preferencia no está guardada aún |

### Retorno

Una tupla `[valor, actualizar]`:

| Elemento | Tipo | Descripción |
|----------|------|-------------|
| `valor` | `T` | Valor actual de la preferencia |
| `actualizar` | `(v: T) => void` | Actualiza el valor en React y lo persiste en `localStorage` |

---

## Ejemplo básico: toggle de visibilidad

```tsx
import { usePreferencia } from "@olula/lib/usePreferencia.ts";

const MiComponente = () => {
    const [mostrarPanel, setMostrarPanel] = usePreferencia(
        "tpv.mi-componente.mostrar-panel",
        true
    );

    return (
        <>
            <QBoton onClick={() => setMostrarPanel(!mostrarPanel)}>
                {mostrarPanel ? "Ocultar" : "Mostrar"}
            </QBoton>
            {mostrarPanel && <Panel />}
        </>
    );
};
```

## Ejemplo con valor string

```tsx
const [vistaActiva, setVistaActiva] = usePreferencia<"tabla" | "tarjetas">(
    "ventas.pedidos.vista",
    "tabla"
);
```

---

## Convención de claves

Usa el formato `"dominio.modulo.preferencia"` para evitar colisiones entre módulos:

```
"tpv.pagar-efectivo.mostrar-denominaciones"
"ventas.pedidos.vista"
"almacen.articulos.columnas-visibles"
```

---

## Utilidad subyacente

El hook se apoya en `preferencias` (`packages/lib/src/preferencias.ts`), que puede usarse directamente fuera de componentes React (por ejemplo, en lógica de dominio):

```typescript
import { preferencias } from "@olula/lib/preferencias.ts";

// Leer sin hook
const mostrar = preferencias.get("tpv.pagar-efectivo.mostrar-denominaciones", true);

// Escribir sin hook
preferencias.set("tpv.pagar-efectivo.mostrar-denominaciones", false);
```

---

## Notas

- El valor inicial se lee de `localStorage` de forma síncrona en la inicialización del estado, por lo que no hay parpadeo de valores por defecto.
- Los cambios se reflejan inmediatamente en el componente pero no se sincronizan entre pestañas del navegador (no usa el evento `storage`).
- Todos los valores se serializan con `JSON.stringify`, por lo que se admiten booleanos, strings, números y objetos simples.
