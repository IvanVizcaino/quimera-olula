import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.ts";
import { decimalesPrecioCompra } from "../comun/dominio.ts";
import { ArticuloProveedor, NuevoArticuloProveedor } from "./diseño.ts";

export const articuloProveedorVacio = (): ArticuloProveedor => ({
    id: "",
    articuloId: "",
    articulo: "",
    proveedorId: "",
    proveedor: "",
    coste: 0,
    divisaId: "EUR",
    dto: 0,
    refProveedor: "",
    plazo: null,
    uniEmbalaje: null,
    requiereEmbalajes: false,
    porDefecto: false,
});

export const nuevoArticuloProveedorVacio = (
    articuloId: string
): NuevoArticuloProveedor => ({
    articuloId,
    proveedorId: "",
    proveedor: "",
    coste: 0,
    divisaId: "EUR",
    dto: 0,
    refProveedor: "",
    plazo: null,
    uniEmbalaje: null,
    requiereEmbalajes: false,
});

const camposComunes = {
    coste: {
        requerido: true,
        tipo: "moneda" as const,
        get decimales() {
            return decimalesPrecioCompra();
        },
    },
    divisaId: { requerido: false },
    dto: { requerido: false, tipo: "decimal" as const, decimales: 2 },
    refProveedor: { requerido: false },
    plazo: { requerido: false, tipo: "entero" as const },
    uniEmbalaje: { requerido: false, tipo: "entero" as const },
    requiereEmbalajes: { tipo: "checkbox" as const },
};

export const metaNuevoArticuloProveedor: MetaModelo<NuevoArticuloProveedor> = {
    campos: {
        proveedorId: {
            requerido: true,
            validacion: (m) => stringNoVacio(m.proveedorId),
        },
        ...camposComunes,
    },
};

export const metaArticuloProveedor: MetaModelo<ArticuloProveedor> = {
    campos: {
        coste: camposComunes.coste,
        divisaId: camposComunes.divisaId,
        dto: camposComunes.dto,
        refProveedor: camposComunes.refProveedor,
    },
};
