import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoPaginaSuscripcion, EstadoPaginaSuscripcion } from "../diseño.ts";
import {
    abrirPortal, aplicarCambio, cancelarSuscripcion, cargar, cerrarAviso, guardarMandato, iniciarPago,
    reanudarSuscripcion,
} from "./pagina.ts";

export const getMaquina = (): Maquina<EstadoPaginaSuscripcion, ContextoPaginaSuscripcion> => ({
    CARGANDO: {
        carga_solicitada: cargar,
    },
    ERROR: {
        carga_solicitada: cargar,
    },
    SIN_SUSCRIPCION: {
        carga_solicitada: cargar,
    },
    ABIERTA: {
        carga_solicitada: cargar,
        aviso_cerrado: cerrarAviso,
        pago_solicitado: iniciarPago,
        portal_solicitado: abrirPortal,
        mandato_solicitado: "PIDIENDO_MANDATO",
        cambio_confirmado: aplicarCambio,
        cancelacion_solicitada: "CONFIRMANDO_CANCELACION",
        reanudacion_solicitada: reanudarSuscripcion,
    },
    PIDIENDO_MANDATO: {
        mandato_guardado: guardarMandato,
        mandato_cancelado: "ABIERTA",
    },
    CONFIRMANDO_CANCELACION: {
        cancelacion_confirmada: cancelarSuscripcion,
        cancelacion_abandonada: "ABIERTA",
    },
});
