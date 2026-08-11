import { Maquina } from "@olula/lib/diseño.ts";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Empresa } from "../diseño.js";
import * as maestro from "./maestro.js";

export type EstadoMaestroEmpresa = 'INICIAL' | 'CREANDO';

export type ContextoMaestroEmpresa = {
    estado: EstadoMaestroEmpresa;
    empresas: ListaActivaEntidades<Empresa>;
};

export const getMaquina: () => Maquina<EstadoMaestroEmpresa, ContextoMaestroEmpresa> = () => {
    return {
        INICIAL: {
            empresa_seleccionada: [maestro.Empresas.activar],
            empresa_deseleccionada: [maestro.Empresas.desactivar],

            empresa_cambiada: [maestro.Empresas.cambiar],
            empresa_borrada: [maestro.Empresas.quitar],

            recarga_de_empresas_solicitada: maestro.recargarEmpresas,

            criteria_cambiado: [maestro.Empresas.filtrar, maestro.recargarEmpresas],

            siguiente_pagina: [maestro.Empresas.filtrar, maestro.ampliarEmpresas],

            crear_empresa_solicitada: "CREANDO",
        },

        CREANDO: {
            alta_de_empresa_cancelada: "INICIAL",

            empresa_creada: maestro.incluirEmpresaCreadaPorId,
        },
    };
};
