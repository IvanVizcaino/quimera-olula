import { Articulo } from "./diseño.ts";

export const articuloVacio = (): Articulo => ({
    id: "",
    descripcion: "",
    precio: 0,
    grupo_iva_producto_id: "",
});
