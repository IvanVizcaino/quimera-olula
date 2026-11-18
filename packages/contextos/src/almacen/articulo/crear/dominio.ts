import { referenciaArticuloValida } from "#/comun/referencia_articulo.ts";
import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.ts";
import { NuevoArticulo } from "../diseño.ts";

export const nuevoArticuloVacio: NuevoArticulo = {
    id: "",
    descripcion: "",
    grupoIvaProductoId: "",
};

export const metaNuevoArticulo: MetaModelo<NuevoArticulo> = {
    campos: {
        id: { requerido: true, validacion: (m) => referenciaArticuloValida(m.id) },
        descripcion: { requerido: true, validacion: (m) => stringNoVacio(m.descripcion || "") },
        grupoIvaProductoId: { requerido: false },
    },
};
