# useEsMovil

Detecta si el viewport actual es de tipo móvil y se suscribe a los cambios de tamaño de pantalla.

---

## Firma

```typescript
function useEsMovil(breakpoint = 768): boolean
```

### Parámetros

| Parámetro | Tipo | Por defecto | Descripción |
|-----------|------|-------------|-------------|
| `breakpoint` | `number` | `768` | Anchura máxima en píxeles para considerarse móvil |

### Retorno

`true` si el ancho del viewport es ≤ `breakpoint`, `false` en caso contrario.

---

## Comportamiento

- Usa `window.matchMedia` (más preciso que leer `window.innerWidth` en cada render).
- Se inicializa con el tamaño actual del viewport en el momento del montaje.
- Se actualiza reactivamente cuando el usuario redimensiona la ventana o rota el dispositivo.
- Limpia el listener al desmontar el componente.

---

## Ejemplo básico

```tsx
import { useEsMovil } from "@olula/lib/useEsMovil.ts";

const NavegacionPrincipal = () => {
    const esMovil = useEsMovil();

    return esMovil
        ? <MenuHamburguesa />
        : <MenuHorizontal />;
};
```

## Ejemplo con breakpoint personalizado

```tsx
const esTablet = useEsMovil(1024);
```

---

## Notas

- El breakpoint por defecto (768px) es consistente con el breakpoint del grid CSS de formularios (`@media (max-width: 768px)` en `qform.css`).
- Internamente utilizado por [`useLayout`](./useLayout.md).
- En entornos SSR donde `window` no existe, el estado inicial es `false`.
