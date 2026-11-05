import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { cargarContexto, refrescarUsuario } from "./detalle.js";
import { ContextoDetalleUsuarioTenant, EstadoDetalleUsuarioTenant } from "./diseño.js";

export const getMaquina: () => Maquina<EstadoDetalleUsuarioTenant, ContextoDetalleUsuarioTenant> = () => {
    return {
        INICIAL: {
            usuario_id_cambiado: [cargarContexto],
            usuario_deseleccionado: [
                publicar('usuario_deseleccionado', null),
            ],
        },

        ABIERTO: {
            usuario_guardado: [refrescarUsuario],
            borrado_solicitado: "BORRANDO",
            usuario_id_cambiado: [cargarContexto],
        },

        BORRANDO: {
            usuario_borrado: [
                publicar('usuario_borrado', null),
                "INICIAL",
            ],
            borrado_cancelado: "ABIERTO",
        },
    };
};
