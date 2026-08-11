# useLista

Gestiona el estado de una lista de entidades con selección activa. Es el hook estándar para el panel maestro del patrón maestro/detalle.

---

## Firma

```typescript
function useLista<E extends Entidad>(listaInicial: E[]): HookLista<E>
```

Requiere que las entidades tengan propiedad `id: string` (contrato de `Entidad`).

---

## Retorno: HookLista\<E\>

```typescript
type HookLista<E extends Entidad> = {
    lista: E[]
    setLista: (lista: E[]) => void
    refrescar: (lista: E[], id?: string) => void
    añadir: (entidad: E) => void
    eliminar: (entidad: E) => void
    modificar: (entidad: E) => void
    seleccionar: (entidad: E) => void
    seleccionarPorId: (id: string) => void
    limpiarSeleccion: () => void
    seleccionada: E | null
    idSeleccionada: string | null
}
```

---

## Métodos

### `setLista(lista)`

Reemplaza la lista completa. En escritorio (viewport > 768px) selecciona automáticamente el primer elemento. En móvil no hace auto-selección.

```typescript
setLista(lista);
```

### `refrescar(lista, id?)`

Reemplaza la lista intentando preservar la selección actual. Útil tras recargar desde la API.

- Si `id` se pasa explícitamente, selecciona ese elemento en la nueva lista.
- Si no, intenta mantener el elemento que estaba seleccionado.
- Si el elemento ya no existe, selecciona el que ocupa su posición (o el último).

```typescript
refrescar(nuevaLista);
refrescar(nuevaLista, idEspecifico);
```

### `añadir(entidad)`

Inserta la entidad al principio de la lista y la selecciona.

```typescript
añadir(nuevaEntidad);
```

### `eliminar(entidad)`

Elimina la entidad. La selección pasa al elemento siguiente; si no hay siguiente, al anterior.

```typescript
eliminar(entidad);
```

### `modificar(entidad)`

Reemplaza la entidad con el mismo `id` y la selecciona.

```typescript
modificar(entidadActualizada);
```

### `seleccionar(entidad)`

Selecciona la entidad si existe en la lista.

### `seleccionarPorId(id)`

Selecciona la entidad por su `id`.

### `limpiarSeleccion()`

Limpia la selección (`seleccionada` pasa a `null`).

---

## Propiedades de solo lectura

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `lista` | `E[]` | Lista actual de entidades |
| `seleccionada` | `E \| null` | Entidad actualmente seleccionada |
| `idSeleccionada` | `string \| null` | Id de la entidad seleccionada |

---

## Ejemplo de uso

```tsx
import { useLista } from "@olula/lib/useLista.ts";

export const MaestroConDetalleClientes = () => {
    const clientes = useLista<Cliente>([]);

    const cargar = async () => {
        const lista = await getClientes();
        clientes.setLista(lista);
    };

    useEffect(() => { cargar(); }, []);

    return (
        <div>
            <ul>
                {clientes.lista.map(c => (
                    <li
                        key={c.id}
                        onClick={() => clientes.seleccionar(c)}
                        className={c.id === clientes.idSeleccionada ? "activo" : ""}
                    >
                        {c.nombre}
                    </li>
                ))}
            </ul>

            {clientes.seleccionada && (
                <DetalleCliente
                    cliente={clientes.seleccionada}
                    onModificado={clientes.modificar}
                    onEliminado={clientes.eliminar}
                />
            )}
        </div>
    );
};
```

---

## Notas

- La inicialización con `listaInicial` selecciona automáticamente el primer elemento.
- `useLista` no hace llamadas a la API. La carga de datos es responsabilidad del componente o de la máquina de estados.
- En flujos con `useMaquina4`, generalmente no se usa `useLista` directamente: el contexto de la máquina contiene la lista como `ListaEntidades<E>` y se gestiona con `accionesListaEntidades`.
