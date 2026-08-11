# Control de acceso

### Crear permiso general para los grupos para probar bien

Hay que tener en cuenta que debe existir al menos un permiso general a true para el grupo con el que trabajemos para tener acceso a la API.

```sql
INSERT INTO flpermissions (value, idrule, idgroup) VALUES (true, 'general', '[grupo_id]');
```

### Describir sistema de reglas (jerarquía)

El sistema de reglas permite definir permisos de acceso a funcionalidades de la aplicación de forma jerárquica.  
Las reglas pueden tener varios niveles, por ejemplo:  
- `ventas.cliente.leer`
- `ventas.cliente`
- `general`

Cada regla puede tener un permiso asociado para un grupo concreto.

---

### Funcionamiento de la función `puede`

La función `puede(regla: string): boolean` determina si el usuario tiene permiso para una acción concreta siguiendo la jerarquía de reglas:

1. **Permiso exacto:**  
   Si existe un permiso explícito para la regla (por ejemplo, `"ventas.cliente.leer"`), se toma ese valor (`true` o `false`).

2. **Permiso de nivel superior:**  
   Si no existe o es `null`, se elimina la última parte y se comprueba el permiso del nivel superior (por ejemplo, `"ventas.cliente"`).

3. **Permiso general:**  
   Si tampoco existe, se comprueba el permiso `"general"`.

4. **Por defecto:**  
   Si no existe ningún permiso en la jerarquía, se devuelve `false`.

#### Ejemplo de uso en menú lateral

En el menú lateral, antes de mostrar un elemento, se comprueba(Si el elemento tiene regla) si el usuario tiene permiso usando la función `puede`:

```typescript
if ("regla" in elemento && elemento.regla && !puede(elemento.regla)) {
  return null; // No mostrar el elemento
}
```

#### Ejemplo de uso en formulario

En los formularios, se puede usar `puede` para habilitar o deshabilitar acciones según el permiso:

```typescript
if (!puede("ventas.cliente.crear")) {
  // Deshabilitar botón de crear cliente
}
```

---

### Establecer la regla de acceso general (valor por defecto)

Si no existe permiso específico ni de nivel superior, la regla `"general"` actúa como valor por defecto para el acceso.
