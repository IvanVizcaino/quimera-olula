import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.js";
import { NuevaOportunidadVenta } from "./diseño.ts";

const tieneOrigen = (oportunidad: NuevaOportunidadVenta) => {
    return oportunidad.cliente_id || oportunidad.tarjeta_id || oportunidad.contacto_id
        ? true
        : "Debe indicar cliente, tarjeta o contacto";
};

export const nuevaOportunidadVentaVacia: NuevaOportunidadVenta = {
    descripcion: '',
    importe: 0,
    cliente_id: '',
    nombre_cliente: '',
    contacto_id: '',
    tarjeta_id: '',
    nombre_tarjeta: '',
};

export const metaNuevaOportunidadVenta: MetaModelo<NuevaOportunidadVenta> = {
    campos: {
        descripcion: { requerido: true, validacion: (oportunidad: NuevaOportunidadVenta) => stringNoVacio(oportunidad.descripcion) },
        importe: { requerido: false, tipo: "moneda" },
        cliente_id: { requerido: false, tipo: "autocompletar", validacion: tieneOrigen },
        tarjeta_id: { requerido: false, tipo: "autocompletar", validacion: tieneOrigen },
    },
};