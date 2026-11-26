import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.ts";
import { NuevoPlanProduccion } from "../diseño.ts";
import { hoy } from "../dominio.ts";

export const LONGITUD_MAXIMA_CODIGO = 12;

export const metaNuevoPlanProduccion: MetaModelo<NuevoPlanProduccion> = {
    campos: {
        id: {
            requerido: true,
            validacion: (m) => stringNoVacio(m.id) && m.id.length <= LONGITUD_MAXIMA_CODIGO,
        },
        descripcion: { requerido: true, validacion: (m) => stringNoVacio(m.descripcion) },
        fecha: { requerido: true, validacion: (m) => stringNoVacio(m.fecha) },
        fechaSolicitada: { requerido: false },
        fechaProveedor: { requerido: false },
    },
};

/** Por defecto las tres fechas son hoy. */
export const nuevoPlanProduccionInicial = (): NuevoPlanProduccion => {
    const fecha = hoy();
    return { id: "", descripcion: "", fecha, fechaSolicitada: fecha, fechaProveedor: fecha };
};
