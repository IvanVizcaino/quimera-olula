import { OrdenAlmacen } from "../../diseño.ts";
import { NuevaLineaOrden } from "./diseño.ts";

export const nuevaLineaOrdenVacia: NuevaLineaOrden = {
    sku: "",
    cantidadPrevista: 0,
    idUbicacionOrigen: null,
    idCajaOrigen: null,
    idUbicacionDestino: null,
    idCajaDestino: null,
};

export const nuevaLineaOrdenDesdeOrden = (orden: OrdenAlmacen): NuevaLineaOrden => ({
    sku: "",
    cantidadPrevista: 0,
    idUbicacionOrigen: orden.idUbicacionOrigen,
    idCajaOrigen: orden.idCajaOrigen,
    idUbicacionDestino: orden.idUbicacionDestino,
    idCajaDestino: orden.idCajaDestino,
});
