import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { Empresa } from "../diseño.js";
import { cargarContexto, refrescarEmpresa } from "./detalle.js";

export type EstadoDetalleEmpresa =
    | 'INICIAL'
    | 'ABIERTO'
    | 'BORRANDO';

export type ContextoDetalleEmpresa = {
    estado: EstadoDetalleEmpresa;
    empresa: Empresa;
};

export const getMaquina: () => Maquina<EstadoDetalleEmpresa, ContextoDetalleEmpresa> = () => {
    return {
        INICIAL: {
            empresa_id_cambiado: [cargarContexto],

            empresa_deseleccionada: [
                publicar('empresa_deseleccionada', null),
            ],
        },

        ABIERTO: {
            empresa_guardada: [refrescarEmpresa],

            borrado_solicitado: "BORRANDO",

            empresa_id_cambiado: [cargarContexto],
        },

        BORRANDO: {
            empresa_borrada: [
                publicar('empresa_borrada', null),
                "INICIAL",
            ],

            borrado_cancelado: "ABIERTO",
        },
    };
};
