import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { Asiento } from "../../diseño.ts";
import { asientoVacio } from "../../dominio.ts";
import { cargarContexto, onAsientoActualizado } from "./detalle.ts";

export type EstadoDetalleAsiento = "INICIAL" | "ABIERTO" | "CAMBIANDO" | "BORRANDO";

export type ContextoDetalleAsiento = {
    estado: EstadoDetalleAsiento;
    asiento: Asiento;
};

export const getMaquina: () => Maquina<EstadoDetalleAsiento, ContextoDetalleAsiento> = () => ({
    INICIAL: {
        asiento_id_cambiado: [cargarContexto],
        asiento_deseleccionado: [publicar("asiento_deseleccionado", null)],
    },
    ABIERTO: {
        asiento_id_cambiado: [cargarContexto],
        cambio_asiento_solicitado: "CAMBIANDO",
        borrado_solicitado: "BORRANDO",
    },
    CAMBIANDO: {
        asiento_actualizado: [onAsientoActualizado],
        cambio_de_asiento_cancelado: "ABIERTO",
    },
    BORRANDO: {
        asiento_borrado: [
            async (ctx, id) => [ctx, [["asiento_borrado", id], ["asiento_deseleccionado", null]]],
            async (ctx) => ({ ...ctx, asiento: asientoVacio() }),
            "INICIAL",
        ],
        borrado_de_asiento_cancelado: "ABIERTO",
    },
});

export const contextoDetalleAsientoInicial: ContextoDetalleAsiento = {
    estado: "INICIAL",
    asiento: asientoVacio(),
};
