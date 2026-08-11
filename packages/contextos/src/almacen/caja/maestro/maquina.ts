import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroCaja, EstadoMaestroCaja } from "./diseño.ts";
import { ampliarCajas, Cajas, incluirCajaCreadaPorId, recargarCajas } from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoMaestroCaja, ContextoMaestroCaja> = () => ({
    INICIAL: {
        caja_seleccionada: [Cajas.activar],
        caja_deseleccionada: [Cajas.desactivar],

        caja_cambiada: [Cajas.cambiar],
        caja_borrada: [Cajas.quitar],

        recarga_de_cajas_solicitada: recargarCajas,

        criteria_cambiado: [Cajas.filtrar, recargarCajas],

        siguiente_pagina: [Cajas.filtrar, ampliarCajas],

        crear_caja_solicitado: "CREANDO",
    },
    CREANDO: {
        alta_de_caja_cancelada: "INICIAL",

        caja_creada: incluirCajaCreadaPorId,
    },
});
