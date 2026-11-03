import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroConexionBancaria, EstadoMaestroConexionBancaria } from "./diseño.js";
import * as maestro from "./maestro.js";

export const getMaquina: () => Maquina<EstadoMaestroConexionBancaria, ContextoMaestroConexionBancaria> = () => {
    return {
        INICIAL: {
            conexion_bancaria_seleccionada: [maestro.Conexiones.activar],
            conexion_bancaria_deseleccionada: [maestro.Conexiones.desactivar],

            conexion_bancaria_cambiada: [maestro.Conexiones.cambiar],
            conexion_bancaria_borrada: [maestro.Conexiones.quitar],

            recarga_de_conexiones_bancarias_solicitada: maestro.recargarConexiones,

            criteria_cambiado: [maestro.Conexiones.filtrar, maestro.recargarConexiones],

            siguiente_pagina: [maestro.Conexiones.filtrar, maestro.ampliarConexiones],

            conectar_banco_solicitado: "CONECTANDO",

            reautenticar_conexion_solicitada: [maestro.prepararReautenticacion],
        },

        REAUTENTICANDO: {
            conexion_bancaria_reautenticada: [maestro.aplicarReautenticacion],

            reautenticacion_cancelada: [maestro.cancelarReautenticacion],
        },

        CONECTANDO: {
            conexion_bancaria_creada: maestro.incluirConexionCreadaPorId,

            conexion_bancaria_conexion_cancelada: "INICIAL",
        },
    };
};
