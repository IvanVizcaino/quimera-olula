export const PALET_ID = "6";

/** Campo de texto vacío. `useModelo` deja en `null` el campo que se borra, aunque su tipo sea `string`. */
export const sinTexto = (s: string | null | undefined): boolean => !s || s.trim() === "";
