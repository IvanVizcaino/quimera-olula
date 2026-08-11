# useForm

Hook mínimo para gestionar el ciclo aceptar/cancelar de un formulario modal. Evita que el usuario cancele mientras se está procesando una acción asíncrona.

---

## Firma

```typescript
function useForm(
    aceptar_: () => void,
    cancelar_: () => void
): [aceptar: () => void, cancelar: () => void]
```

### Parámetros

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `aceptar_` | `() => void` | Función a ejecutar al aceptar (puede ser async) |
| `cancelar_` | `() => void` | Función a ejecutar al cancelar |

---

## Retorno

Tupla `[aceptar, cancelar]`:

- `aceptar` — Ejecuta `aceptar_` dentro de `ContextoError`. Durante la ejecución, bloquea el cancelar.
- `cancelar` — Ejecuta `cancelar_` solo si no hay una acción en curso.

---

## Comportamiento

1. Al llamar a `aceptar()`, activa internamente el estado `aceptando = true`.
2. Mientras `aceptando` está activo, llamar a `cancelar()` no tiene efecto.
3. Si `aceptar_` lanza un error, `aceptando` vuelve a `false` (el error se propaga a `ContextoError`).

---

## Ejemplo

```tsx
import { useForm } from "@olula/lib/useForm.ts";

const BorrarCliente = ({
    cliente,
    onConfirmado,
    onCancelado,
}: {
    cliente: Cliente;
    onConfirmado: () => void;
    onCancelado: () => void;
}) => {
    const [aceptar, cancelar] = useForm(
        async () => {
            await deleteCliente(cliente.id);
            onConfirmado();
        },
        onCancelado
    );

    return (
        <QModalConfirmacion
            titulo="Confirmar borrado"
            mensaje={`¿Borrar ${cliente.nombre}?`}
            onAceptar={aceptar}
            onCerrar={cancelar}
        />
    );
};
```

---

## Notas

- Requiere que el componente esté dentro de un `ContextoError` (todos los módulos lo están por defecto).
- Es un hook muy simple: úsalo en modales de confirmación o formularios pequeños.
- Para flujos más complejos (múltiples pasos, estados intermedios) usa [`useMaquina`](./useMaquina.md).
