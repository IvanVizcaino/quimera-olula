# Guía de estilos para `quimera-formulario`

Esta guía resume cómo maquetar formularios con `quimera-formulario` usando CSS Grid, siguiendo el comportamiento actual del sistema.

## 1) Base del layout (cómo funciona)

`quimera-formulario` está definido en [packages/componentes/src/atomos/qform.css](../packages/componentes/src/atomos/qform.css):

- Desktop: grid de 12 columnas.
- Móvil (`max-width: 768px`): grid de 2 columnas.
- En móvil, los campos habituales pasan a ancho completo (`grid-column: 1 / -1 !important`).
- Los `div` hijos directos ahora también se comportan como ítems de grid (ancho completo), útil para wrappers como tabs.

## 2) Regla principal para estilos por pantalla

Define el layout del formulario en el CSS de la vista (no en línea), usando selectores por `nombre`:

```css
.Modulo .TabX {
  quimera-input[nombre="nombre"] {
    grid-column: span 12;
  }

  quimera-date[nombre="fecha"] {
    grid-column: span 3;
  }

  quimera-select[nombre="estado"] {
    grid-column: span 4;
  }
}
```

## 2.1) Cómo pensar `grid-column`

En `quimera-formulario` trabajamos sobre una rejilla de 12 columnas en desktop.

Hay dos formas habituales de colocar un elemento:

- `grid-column: span 3;`
- `grid-column: 1 / span 3;`

La diferencia es importante:

### `grid-column: span 3`

Significa: “ocupa 3 columnas, empezando donde toque según el flujo natural del grid”.

Ejemplo:

```css
quimera-date[nombre="fecha"] {
  grid-column: span 3;
}

quimera-select[nombre="estado"] {
  grid-column: span 4;
}
```

Si antes hay sitio libre en la fila actual, el elemento se coloca ahí. Si no cabe, baja a la siguiente fila.

### `grid-column: 1 / span 3`

Significa: “empieza en la columna 1 y ocupa 3 columnas”.

Esto **fuerza** a empezar una nueva fila visual, porque el elemento ya no se coloca “donde toque”, sino que se ancla al inicio de la rejilla.

Ejemplo:

```css
quimera-select[nombre="divisa_id"] {
  grid-column: 1 / span 2;
}
```

Aunque la fila anterior tenga hueco, este campo arrancará desde la columna 1. Ese es el reemplazo limpio de los antiguos `div` espaciadores.

## 2.2) Regla mental rápida

- Usa `span X` cuando solo quieres “ancho”.
- Usa `1 / span X` cuando quieres “ancho + empezar fila nueva”.

## 2.3) Ejemplo real: dos campos en la misma fila en móvil

Por defecto, en móvil los campos suelen ocupar todo el ancho:

```css
grid-column: 1 / -1 !important;
```

Pero puedes hacer excepciones para colocar dos campos uno al lado del otro.

Ejemplo real de [packages/contextos/src/ventas/cliente/detalle/TabGeneral.css](../packages/contextos/src/ventas/cliente/detalle/TabGeneral.css):

```css
@media (max-width: 768px) {
  quimera-select[nombre="tipo_id_fiscal"] {
    grid-column: 1 / span 1 !important;
  }

  quimera-input[nombre="id_fiscal"] {
    grid-column: 2 / span 1 !important;
  }
}
```

Como en móvil el formulario tiene 2 columnas:

- `1 / span 1` = primera mitad
- `2 / span 1` = segunda mitad

Resultado: los dos campos quedan en la misma fila, uno a la izquierda y otro a la derecha.

## 2.4) Ejemplos típicos

### Campo a ancho completo

```css
quimera-input[nombre="nombre"] {
  grid-column: span 12;
}
```

### Tres campos repartidos en una fila

```css
quimera-date[nombre="fecha"] {
  grid-column: span 4;
}

quimera-select[nombre="prioridad"] {
  grid-column: span 4;
}

quimera-select[nombre="estado"] {
  grid-column: span 4;
}
```

### Forzar nueva fila sin espaciador

```css
quimera-autocompletar[nombre="agente_id"] {
  grid-column: 1 / span 9;
}

quimera-select[nombre="forma_pago_id"] {
  grid-column: 1 / span 2;
}
```

Aquí `forma_pago_id` empieza nueva fila porque arranca en la columna 1.

## 3) Forzar salto de línea (sin `div` espaciadores)

Evitar:

- `<div id="espacio_*" />`
- Reglas tipo `div[id="espacio_*"] { grid-column: ... }`

Usar en su lugar inicio explícito de columna para el campo que debe arrancar nueva fila:

```css
quimera-select[nombre="divisa_id"] {
  grid-column: 1 / span 2;
}

quimera-autocompletar[nombre="agente_id"] {
  grid-column: 1 / span 9;
}

quimera-select[nombre="forma_pago_id"] {
  grid-column: 1 / span 2;
}
```

## 4) Uso de `div` dentro de `quimera-formulario`

Sí, se pueden usar `div` contenedores (por ejemplo para `<Tabs>`):

```tsx
<quimera-formulario>
  <QInput ... />
  <div className="Tabs">...</div>
</quimera-formulario>
```

Recomendaciones:

- Si ese wrapper debe ocupar toda la fila, dejar el comportamiento por defecto (ya ocupa 12 columnas).
- Si debe ocupar menos, definirlo explícitamente en CSS de la vista:

```css
.TabGeneral .Tabs {
  grid-column: 1 / span 12;
}
```

