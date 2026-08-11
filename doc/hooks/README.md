# Hooks de @olula/lib

Hooks propios del paquete `@olula/lib` (`packages/lib/src/`). Se importan directamente desde el paquete:

```typescript
import { useMaquina } from "@olula/lib/useMaquina.ts";
import { useLista }   from "@olula/lib/useLista.ts";
// etc.
```

---

## Resumen

| Hook | Fichero | Propósito |
|------|---------|-----------|
| [`useMaquina`](./useMaquina.md) | `useMaquina.ts` | Máquina de estados finitos para orquestación de flujos UI |
| [`useLista`](./useLista.md) | `useLista.ts` | Lista de entidades con selección activa |
| [`useModelo`](./useModelo.md) | `useModelo.ts` | Estado de formulario con validación declarativa |
| [`useForm`](./useForm.md) | `useForm.ts` | Control de aceptar/cancelar en modales |
| [`useLayout`](./useLayout.md) | `useLayout.ts` | Toggle tarjeta/tabla con soporte responsive |
| [`useEsMovil`](./useEsMovil.md) | `useEsMovil.ts` | Detección de viewport móvil |
| [`useFocus`](./useFocus.md) | `useFocus.ts` | Auto-foco en un input al montar el componente |
| [`usePreferencia`](./usePreferencia.md) | `usePreferencia.ts` | Preferencia de UI persistida en `localStorage` |

---

## ¿Qué hook usar en cada situación?

- **Orquestar un flujo complejo** (modal que abre otro modal, estados de carga, acciones encadenadas) → [`useMaquina`](./useMaquina.md)
- **Gestionar un listado** maestro con selección → [`useLista`](./useLista.md)
- **Formulario con campos validados** → [`useModelo`](./useModelo.md)
- **Modal con botón aceptar/cancelar** → [`useForm`](./useForm.md)
- **Alternar entre vista tarjeta y tabla** → [`useLayout`](./useLayout.md)
- **Detectar si el usuario está en móvil** → [`useEsMovil`](./useEsMovil.md)
- **Poner el foco en un input al abrir un modal** → [`useFocus`](./useFocus.md)
- **Recordar una preferencia de UI entre sesiones** → [`usePreferencia`](./usePreferencia.md)
