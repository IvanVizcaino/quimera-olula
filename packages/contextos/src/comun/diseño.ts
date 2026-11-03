export interface Direccion {
    nombre_via: string;
    tipo_via: string;
    numero: string;
    otros: string;
    cod_postal: string;
    ciudad: string;
    provincia_id: string;
    provincia: string;
    pais_id: string;
    apartado: string;
    telefono: string;
};

/**
 * Estado de un documento tal como se pinta en listados y detalle. El tono lleva
 * el significado (no el color): pendiente espera a que pase algo, parcial está
 * a medias, completado terminó bien, borrador aún no cuenta y error pide actuar.
 */
export type TonoEstado = "pendiente" | "parcial" | "completado" | "borrador" | "error";

export type EstadoEtiqueta = {
    texto: string;
    tono: TonoEstado;
};
