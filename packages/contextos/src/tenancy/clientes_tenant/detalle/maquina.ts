import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { cargarContexto, refrescarCliente } from "./detalle.js";
import { ContextoDetalleClienteTenant, EstadoDetalleClienteTenant } from "./diseño.js";

export const getMaquina: () => Maquina<EstadoDetalleClienteTenant, ContextoDetalleClienteTenant> = () => {
    return {
        INICIAL: {
            cliente_id_cambiado: [cargarContexto],
            cliente_deseleccionado: [
                publicar('cliente_deseleccionado', null),
            ],
        },

        ABIERTO: {
            cliente_guardado: [refrescarCliente],
            borrado_solicitado: "BORRANDO",
            cliente_id_cambiado: [cargarContexto],
        },

        BORRANDO: {
            cliente_borrado: [
                publicar('cliente_borrado', null),
                "INICIAL",
            ],
            borrado_cancelado: "ABIERTO",
        },
    };
};
