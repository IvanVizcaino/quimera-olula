import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroClienteTenant, EstadoMaestroClienteTenant } from "./diseño.js";
import * as maestro from "./maestro.js";

export const getMaquina: () => Maquina<EstadoMaestroClienteTenant, ContextoMaestroClienteTenant> = () => {
    return {
        INICIAL: {
            cliente_seleccionado: [maestro.Clientes.activar],
            cliente_deseleccionado: [maestro.Clientes.desactivar],
            cliente_cambiado: [maestro.Clientes.cambiar],
            cliente_borrado: [maestro.Clientes.quitar],
            recarga_de_clientes_solicitada: maestro.recargarClientes,
            criteria_cambiado: [maestro.Clientes.filtrar, maestro.recargarClientes],
            siguiente_pagina: [maestro.Clientes.filtrar, maestro.ampliarClientes],
            crear_cliente_solicitado: "CREANDO",
        },

        CREANDO: {
            alta_de_cliente_cancelada: "INICIAL",
            cliente_creado: maestro.incluirClienteCreadoPorId,
        },
    };
};
