import { MetaModelo } from "@olula/lib/dominio.ts";
import { LineaOrdenAlmacen, OrdenAlmacen } from "./diseño.ts";

export const ERR_SKU_REQUERIDO = "El SKU es requerido";
export const ERR_CANTIDAD_PREVISTA_REQUERIDA = "La cantidad prevista es requerida";

export const ordenVacia = (): OrdenAlmacen => ({
    id: "",
    fecha: new Date().toISOString().slice(0, 10),
    tipo: "ENTRADA",
    almacenId: "",
    almacen: "",
    abierta: true,
    estado: "",
    descripcion: "",
    idUbicacionOrigen: null,
    ubicacionOrigen: null,
    idCajaOrigen: null,
    idUbicacionDestino: null,
    ubicacionDestino: null,
    idCajaDestino: null,
    lineas: [],
    lecturasCaja: [],
});

export const lineaOrdenVacia = (): LineaOrdenAlmacen => ({
    id: "",
    sku: "",
    articulo: "",
    loteId: null,
    cantidadPrevista: 0,
    idUbicacionOrigen: null,
    ubicacionOrigen: null,
    idCajaOrigen: null,
    cajaOrigen: null,
    idUbicacionDestino: null,
    ubicacionDestino: null,
    idCajaDestino: null,
    cajaDestino: null,
    lecturas: [],
});

const onOrdenCambiada = (orden: OrdenAlmacen, campo: string, _: unknown, otros?: Record<string, unknown>) => {
    if (campo === "idCajaDestino" && otros) {

        const nuevoValor: OrdenAlmacen = {
            ...orden,
            idUbicacionDestino: otros.idUbicacion as string,
            codUbicacionDestino: otros.codUbicacion as string,
        }
        return nuevoValor
    }
    else if (campo === "idCajaOrigen" && otros) {

        const nuevoValor: OrdenAlmacen = {
            ...orden,
            idUbicacionOrigen: otros.idUbicacion as string,
            codUbicacionOrigen: otros.codUbicacion as string,
        }
        return nuevoValor
    }
    return orden
}

export const metaOrden: MetaModelo<OrdenAlmacen> = {
    campos: {
        tipo: { requerido: true },
        almacenId: { requerido: true },
        fecha: { requerido: true },
        abierta: { tipo: "checkbox", requerido: true },
        idCajaOrigen: {},
        idUbicacionOrigen: {},
        idCajaDestino: {},
        idUbicacionDestino: {},
    },
    onChange: onOrdenCambiada
};



export const metaNuevaLinea: MetaModelo<LineaOrdenAlmacen> = {
    campos: {
        sku: {
            validacion: (linea) => {
                if (linea.sku === null || linea.sku === undefined || linea.sku === "") {
                    return ERR_SKU_REQUERIDO;
                }
                return true;
            },
        },
        cantidadPrevista: {
            tipo: "numero",
            validacion: (linea) => {
                if (linea.cantidadPrevista === null || linea.cantidadPrevista === undefined) {
                    return ERR_CANTIDAD_PREVISTA_REQUERIDA;
                }
                return true;
            },
        },
    },
};
