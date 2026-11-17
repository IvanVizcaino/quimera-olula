import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { cargarContexto, refrescarCodigoBalance } from "./detalle.ts";
import { ContextoDetalleCodigoBalance, EstadoDetalleCodigoBalance } from "./diseño.ts";

export const getMaquina: () => Maquina<EstadoDetalleCodigoBalance, ContextoDetalleCodigoBalance> = () => {
    return {
        INICIAL: {
            codigo_balance_id_cambiado: [cargarContexto],
            codigo_balance_deseleccionado: [publicar("codigo_balance_deseleccionado", null)],
        },

        ABIERTO: {
            codigo_balance_guardado: [refrescarCodigoBalance],
            borrado_solicitado: "BORRANDO",
            codigo_balance_id_cambiado: [cargarContexto],
            codigo_balance_deseleccionado: [publicar("codigo_balance_deseleccionado", null)],
        },

        BORRANDO: {
            codigo_balance_borrado: [publicar("codigo_balance_borrado", null), "INICIAL"],
            borrado_cancelado: "ABIERTO",
        },
    };
};
