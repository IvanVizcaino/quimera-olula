import { referenciaArticuloValida } from "#/comun/referencia_articulo.ts";
import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.ts";
import { Articulo } from "../diseño.ts";

export const nuevoArticuloInicial = (): Partial<Articulo> => ({
    id: "",
    descripcion: "",
    grupoIvaProductoId: "",
});

export const metaNuevoArticulo: MetaModelo<Partial<Articulo>> = {
    campos: {
        id: { requerido: true, validacion: (m) => referenciaArticuloValida(m.id) },
        descripcion: { requerido: true, validacion: (m) => stringNoVacio(m.descripcion || "") },
        grupoIvaProductoId: { requerido: false },
    },
};
