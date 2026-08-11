import { OrdenAlmacen, TipoOrden } from "#/almacen/orden/diseño.ts";
import { Modelo } from "@olula/lib/diseño.js";
import { MetaModelo } from "@olula/lib/dominio.js";

export interface ModeloLecturaCajaOrden extends Modelo {
    cajaId: string;
    idUbicacionDestino: string | null;
    idCajaDestino: string | null;
    cajaCompleta: boolean;
}

export const getMetaLecturaCajaOrden = (tipo: TipoOrden): MetaModelo<ModeloLecturaCajaOrden> => ({
    campos: {
        cajaId: {
            validacion: (lectura) => {
                if (!lectura.cajaId) return "La caja es requerida";
                return true;
            },
        },
        cajaCompleta: {
            tipo: "checkbox",
        },
        idUbicacionDestino: {
            requerido: tipo === "TRASPASO",
        },
        idCajaDestino: {
        },
    },
});

export const getLecturaCajaOrdenVacia = (orden: OrdenAlmacen): ModeloLecturaCajaOrden => ({
    cajaId: "",
    idUbicacionDestino: orden.idUbicacionDestino,
    idCajaDestino: orden.idCajaDestino,
    cajaCompleta: false,
});
