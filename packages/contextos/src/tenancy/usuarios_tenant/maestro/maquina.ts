import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroUsuarioTenant, EstadoMaestroUsuarioTenant } from "./diseño.js";
import * as maestro from "./maestro.js";

export const getMaquina: () => Maquina<EstadoMaestroUsuarioTenant, ContextoMaestroUsuarioTenant> = () => {
    return {
        INICIAL: {
            usuario_seleccionado: [maestro.Usuarios.activar],
            usuario_deseleccionado: [maestro.Usuarios.desactivar],
            usuario_cambiado: [maestro.Usuarios.cambiar],
            usuario_borrado: [maestro.Usuarios.quitar],
            recarga_de_usuarios_solicitada: maestro.recargarUsuarios,
            criteria_cambiado: [maestro.Usuarios.filtrar, maestro.recargarUsuarios],
            siguiente_pagina: [maestro.Usuarios.filtrar, maestro.ampliarUsuarios],
            crear_usuario_solicitado: "CREANDO",
        },

        CREANDO: {
            alta_de_usuario_cancelada: "INICIAL",
            usuario_creado: maestro.incluirUsuarioCreadoPorId,
        },
    };
};
