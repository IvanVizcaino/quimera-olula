import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { PickingFijo } from "../diseño.ts";
import { cargarContexto, refrescarPickingFijo } from "./detalle.ts";

export type EstadoDetallePickingFijo = "INICIAL" | "ABIERTO" | "BORRANDO";

export type ContextoDetallePickingFijo = {
    estado: EstadoDetallePickingFijo;
    pickingFijo: PickingFijo;
};

export const getMaquina: () => Maquina<EstadoDetallePickingFijo, ContextoDetallePickingFijo> = () => ({
    INICIAL: {
        picking_fijo_id_cambiado: [cargarContexto],
        picking_fijo_deseleccionado: [publicar("picking_fijo_deseleccionado", null)],
    },
    ABIERTO: {
        picking_fijo_id_cambiado: [cargarContexto],
        picking_fijo_guardado: [refrescarPickingFijo],
        borrado_solicitado: "BORRANDO",
        picking_fijo_deseleccionado: [publicar("picking_fijo_deseleccionado", null)],
    },
    BORRANDO: {
        picking_fijo_borrado: [publicar("picking_fijo_borrado", null), "INICIAL"],
        borrado_cancelado: "ABIERTO",
    },
});
