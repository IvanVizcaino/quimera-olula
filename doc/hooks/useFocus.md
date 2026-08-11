# useFocus

Coloca el foco automáticamente en un input cuando el componente se monta. Útil para mejorar la usabilidad de modales y formularios.

---

## Firma

```typescript
function useFocus(seleccionado = false): RefObject<HTMLInputElement>
```

### Parámetros

| Parámetro | Tipo | Por defecto | Descripción |
|-----------|------|-------------|-------------|
| `seleccionado` | `boolean` | `false` | Si es `true`, selecciona también el texto del input al enfocar |

### Retorno

Un `RefObject<HTMLInputElement>` que debe pasarse como `ref` al componente input.

---

## Ejemplo básico

```tsx
import { useFocus } from "@olula/lib/useFocus.ts";

const FormularioCrear = () => {
    const focus = useFocus();

    return (
        <form>
            <QInput
                label="Nombre"
                ref={focus}
                {...uiProps("nombre")}
            />
            <QInput label="Email" {...uiProps("email")} />
        </form>
    );
};
```

## Ejemplo con selección de texto

Útil cuando el usuario necesita reemplazar el valor actual (por ejemplo, un campo de cantidad).

```tsx
const EditarCantidad = ({ cantidad }: { cantidad: number }) => {
    const focus = useFocus(true);  // enfoca Y selecciona el texto

    return (
        <QInput
            label="Cantidad"
            ref={focus}
            {...uiProps("cantidad")}
        />
    );
};
```

## Ejemplo en componente con `useModelo`

```tsx
const NuevaLineaPedido = ({ publicar }: { publicar: ProcesarEvento }) => {
    const linea = useModelo(metaNuevaLinea, nuevaLineaVacia());
    const focus = useFocus();

    const guardar = async () => {
        await postLinea(linea.modelo);
        publicar("linea_creada");
        linea.init(nuevaLineaVacia());
    };

    return (
        <div>
            <QInput
                label="Referencia"
                ref={focus}
                {...linea.uiProps("referencia")}
            />
            <QInput label="Cantidad" {...linea.uiProps("cantidad")} />
            <QBoton onClick={guardar} deshabilitado={!linea.valido}>
                Añadir
            </QBoton>
        </div>
    );
};
```

---

## Notas

- El foco se aplica una sola vez al montar el componente (`useEffect` con array de dependencias vacío).
- Si el componente se monta/desmonta repetidamente (por ejemplo, un modal que abre y cierra), el foco se aplicará cada vez que se monte.
- Funciona con cualquier componente que acepte una prop `ref` y exponga un elemento `HTMLInputElement`.
