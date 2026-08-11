# useModelo

Gestiona el estado de un formulario de edición: modelo actual, validación, cambios pendientes y generación de props para los controles UI.

---

## Firma

```typescript
function useModelo<T extends Modelo>(
    meta: MetaModelo<T>,
    modeloInicialProp: T,
    onModeloListo?: (t: T) => Promise<void>
): HookModelo<T>
```

### Parámetros

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `meta` | `MetaModelo<T>` | Metadatos de validación del modelo |
| `modeloInicialProp` | `T` | Valor inicial del modelo |
| `onModeloListo` | `(t: T) => Promise<void>` | Callback opcional que se ejecuta al confirmar el modelo |

---

## Retorno: HookModelo\<T\>

```typescript
type HookModelo<T extends Modelo> = {
    modelo: T
    modeloInicial: T
    uiProps: (campo: string, secundario?: string) => UiProps
    init: (entidad?: T) => void
    set: (entidad: T) => void
    modificado: boolean
    valido: boolean
    editable: boolean
}
```

### Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `modelo` | `T` | Estado actual del modelo |
| `modeloInicial` | `T` | Snapshot de referencia (para detectar cambios) |
| `modificado` | `boolean` | `true` si el modelo difiere del inicial |
| `valido` | `boolean` | `true` si todos los campos requeridos son válidos |
| `editable` | `boolean` | `true` si el formulario está en modo edición |

### Métodos

#### `uiProps(campo, secundario?)`

Genera las props necesarias para conectar un control UI al campo indicado. Incluye estado de error, valor, tipo, onChange, etc.

```typescript
type UiProps = {
    nombre: string
    valor: ValorCampoUI
    tipo: TipoInput
    textoValidacion: string
    deshabilitado: boolean
    erroneo: boolean
    advertido: boolean
    opcional: boolean
    valido: boolean
    modificado: boolean
    soloTexto: boolean
    onChange: (valor: ValorControl) => void
    evaluarCambio: () => void
    descripcion?: string
}
```

El parámetro `secundario` permite vincular un campo de descripción/texto al mismo control (por ejemplo, un buscador que tiene `id` y `descripcion`).

#### `init(entidad?)`

Resetea el modelo al estado inicial. Si se pasa `entidad`, la usa como nuevo inicial.

```typescript
modelo.init();                 // vuelve al modeloInicialProp
modelo.init(entidadNueva);    // establece entidadNueva como nuevo inicial
```

#### `set(entidad)`

Actualiza el modelo sin cambiar el `modeloInicial` (el cambio queda como "pendiente").

---

## MetaModelo

Define las reglas de validación de cada campo. Se define en `dominio.ts`:

```typescript
import { MetaModelo } from "@olula/lib/dominio.ts";

export const metaCliente: MetaModelo<Cliente> = {
    campos: {
        nombre:    { requerido: true },
        email:     { tipo: "email", requerido: false },
        descuento: { tipo: "numero", requerido: false },
        codigo:    { bloqueado: true },               // solo lectura
        notas:     { tipo: "texto_largo" },
    }
}
```

### Opciones de campo

| Opción | Tipo | Descripción |
|--------|------|-------------|
| `requerido` | `boolean` | El campo no puede estar vacío |
| `bloqueado` | `boolean` | Siempre deshabilitado (solo lectura) |
| `tipo` | `TipoInput` | `"texto"`, `"numero"`, `"moneda"`, `"email"`, `"fecha"`, `"booleano"`, etc. |

---

## Ejemplo completo

```tsx
// dominio.ts
export const metaNuevoCliente: MetaModelo<NuevoCliente> = {
    campos: {
        nombre:   { requerido: true },
        email:    { tipo: "email" },
        grupo_id: { requerido: true },
    }
}

export const nuevoClienteVacio = (): NuevoCliente => ({
    nombre: "",
    email: "",
    grupo_id: "",
})
```

```tsx
// CrearCliente.tsx
export const CrearCliente = ({
    activo,
    publicar,
    onCancelar,
}: {
    activo: boolean;
    publicar: ProcesarEvento;
    onCancelar: () => void;
}) => {
    const cliente = useModelo(metaNuevoCliente, nuevoClienteVacio());

    const guardar = async () => {
        const id = await postCliente(cliente.modelo);
        const nuevo = await getCliente(id);
        publicar("cliente_creado", nuevo);
        cliente.init(nuevoClienteVacio());
    };

    const cancelar = () => {
        cliente.init(nuevoClienteVacio());
        onCancelar();
    };

    return (
        <QModal activo={activo} onCerrar={cancelar} titulo="Nuevo cliente">
            <QInput label="Nombre" {...cliente.uiProps("nombre")} />
            <QInput label="Email"  {...cliente.uiProps("email")} />
            <QBoton onClick={guardar} deshabilitado={!cliente.valido}>
                Guardar
            </QBoton>
        </QModal>
    );
};
```

---

## Edición de entidad existente

```tsx
// DetalleCliente.tsx
const cliente = useModelo(metaCliente, clienteInicial);

const guardar = async () => {
    await patchCliente(cliente.modelo.id, cliente.modelo);
    publicar("cliente_cambiado", cliente.modelo);
    cliente.init(cliente.modelo); // marca el estado actual como "inicial"
};

return (
    <>
        <QInput label="Nombre" {...cliente.uiProps("nombre")} />
        <QBoton
            onClick={guardar}
            deshabilitado={!cliente.valido || !cliente.modificado}
        >
            Guardar
        </QBoton>
        <QBoton
            onClick={() => cliente.init()}
            deshabilitado={!cliente.modificado}
        >
            Descartar cambios
        </QBoton>
    </>
);
```

---

## Comportamiento automático

- Cuando `modeloInicialProp` cambia (por ejemplo, al seleccionar otra entidad en el maestro), el hook sincroniza automáticamente `modelo` y `modeloInicial` con el nuevo valor.
- `onModeloListo` se ejecuta dentro de `ContextoError`, por lo que los errores se gestionan centralmente.
