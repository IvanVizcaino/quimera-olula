import { Maquina } from "@olula/lib/diseño.js";
import { ContextoMaestroVentasTpv, EstadoMaestroVentasTpv } from "../diseño.ts";
import { Ventas, ampliarVentas, incluirVentaCreadaPorId, recargarVentas } from "./maestro.ts";


export const getMaquina: () => Maquina<EstadoMaestroVentasTpv, ContextoMaestroVentasTpv> = () => {

    return {

        INICIAL: {

            venta_cambiada: [Ventas.cambiar],

            venta_seleccionada: [Ventas.activar],

            venta_deselaccionada: [Ventas.desactivar],

            venta_borrada: [Ventas.quitar],

            recarga_de_ventas_solicitada: recargarVentas,

            crear_venta_solicitada: "CREANDO",

            criteria_cambiado: [Ventas.filtrar, recargarVentas],

            siguiente_pagina: [Ventas.filtrar, ampliarVentas],
        },

        CREANDO: {

            venta_creada: incluirVentaCreadaPorId,

            alta_de_venta_cancelada: "INICIAL",
        },
    }
}
