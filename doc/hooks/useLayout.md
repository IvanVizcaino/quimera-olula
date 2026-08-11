# useLayout

Gestiona el modo de visualización de un listado (tarjeta o tabla) con soporte automático para dispositivos móviles.

---

## Firma

```typescript
export type Layout = "TARJETA" | "TABLA";

function useLayout(defecto?: Layout): {
    layout: Layout;
    cambiarLayout: () => void;
    esMovil: boolean;
}
```

### Parámetros

| Parámetro | Tipo | Por defecto | Descripción |
|-----------|------|-------------|-------------|
| `defecto` | `Layout` | `"TARJETA"` | Layout inicial en escritorio |

---

## Retorno

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `layout` | `Layout` | Layout efectivo actual (`"TARJETA"` o `"TABLA"`) |
| `cambiarLayout` | `() => void` | Alterna entre `TARJETA` y `TABLA` |
| `esMovil` | `boolean` | `true` si el viewport es ≤ 768px |

---

## Comportamiento responsive

- En **móvil** (`esMovil === true`): `layout` siempre devuelve `"TARJETA"`, independientemente del estado interno.
- En **escritorio**: `layout` refleja el estado del toggle.
- `cambiarLayout` siempre actualiza el estado interno; el efecto solo se ve en escritorio.

---

## Ejemplo de uso

```tsx
import { useLayout } from "@olula/lib/useLayout.ts";

const ListadoProductos = () => {
    const { layout, cambiarLayout, esMovil } = useLayout("TABLA");

    return (
        <div>
            {!esMovil && (
                <QBoton onClick={cambiarLayout}>
                    {layout === "TABLA" ? "Ver tarjetas" : "Ver tabla"}
                </QBoton>
            )}

            {layout === "TABLA"
                ? <TablaProductos productos={productos} />
                : <TarjetasProductos productos={productos} />
            }
        </div>
    );
};
```

---

## Howto: añadir toggle de layout a un listado existente

1. Importar `useLayout` en el componente maestro.

```typescript
import { useLayout } from "@olula/lib/useLayout.ts";
```

2. Declarar el hook con el layout por defecto deseado.

```typescript
const { layout, cambiarLayout, esMovil } = useLayout("TARJETA");
```

3. Añadir el botón de toggle (solo visible en escritorio).

```tsx
{!esMovil && (
    <QBoton onClick={cambiarLayout} variante="icono">
        {layout === "TARJETA" ? <IconoTabla /> : <IconoTarjeta />}
    </QBoton>
)}
```

4. Renderizar condicionalmente según `layout`.

```tsx
{layout === "TARJETA"
    ? <ListadoEnTarjetas entidades={lista} />
    : <ListadoEnTabla entidades={lista} />
}
```

---

## Relación con useEsMovil

`useLayout` usa [`useEsMovil`](./useEsMovil.md) internamente. Si solo necesitas detectar si el usuario está en móvil (sin gestionar layouts), usa `useEsMovil` directamente.
