/** Icono de las acciones habituales (Nuevo…, Editar, Borrar…) según su texto. En
 *  móvil, en la cabecera de los listados, el botón muestra solo el icono. */
export const iconoAccionBoton = (texto: string): string | undefined => {
  const primera = texto.trim().split(/\s+/)[0]?.toLowerCase() ?? "";
  if (["nuevo", "nueva", "añadir", "crear"].includes(primera)) return "crear";
  if (["editar", "cambiar", "modificar"].includes(primera)) return "editar";
  if (["borrar", "eliminar"].includes(primera)) return "eliminar";
  return undefined;
};
