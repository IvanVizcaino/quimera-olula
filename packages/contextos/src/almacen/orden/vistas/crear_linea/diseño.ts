import { MetaModelo } from "@olula/lib/dominio.ts";
import { TipoOrden } from "../../diseño.ts";

export type NuevaLineaOrden = {
    sku: string;
    cantidadPrevista: number;
    idUbicacionOrigen: string | null;
    idCajaOrigen: string | null;
    idUbicacionDestino: string | null;
    idCajaDestino: string | null;
};

const requiereOrigen = (tipo: TipoOrden) => tipo === "SALIDA" || tipo === "TRASPASO";
const requiereDestino = (tipo: TipoOrden) => tipo === "ENTRADA" || tipo === "TRASPASO";


const onNuevaLineaCambiada = (linea: NuevaLineaOrden, campo: string, _: unknown, otros?: Record<string, unknown>) => {
    if (campo === "idCajaDestino" && otros) {

        const nuevoValor: NuevaLineaOrden = {
            ...linea,
            idUbicacionDestino: otros.idUbicacion as string,
            // codUbicacionDestino: otros.codUbicacion as string,
        }
        return nuevoValor
    }
    else if (campo === "idCajaOrigen" && otros) {

        const nuevoValor: NuevaLineaOrden = {
            ...linea,
            idUbicacionOrigen: otros.idUbicacion as string,
            // codUbicacionOrigen: otros.codUbicacion as string,
        }
        return nuevoValor
    }
    return linea
}


export const getMetaNuevaLineaOrden = (tipo: TipoOrden): MetaModelo<NuevaLineaOrden> => ({
    campos: {
        sku: {
            validacion: (linea) => {
                if (!linea.sku) return "El SKU es requerido";
                return true;
            },
        },
        cantidadPrevista: {
            tipo: "numero",
            validacion: (linea) => {
                if (linea.cantidadPrevista === null || linea.cantidadPrevista === undefined) {
                    return "La cantidad prevista es requerida";
                }
                return true;
            },
        },
        idUbicacionOrigen: {
            validacion: (linea) => {
                if (requiereOrigen(tipo) && !linea.idUbicacionOrigen) {
                    return "La ubicación origen es requerida";
                }
                return true;
            },
        },
        idCajaOrigen: {},
        idUbicacionDestino: {
            validacion: (linea) => {
                if (requiereDestino(tipo) && !linea.idUbicacionDestino) {
                    return "La ubicación destino es requerida";
                }
                return true;
            },
        },
        idCajaDestino: {},
    },
    onChange: onNuevaLineaCambiada
});
