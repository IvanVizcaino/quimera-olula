import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { cargarContexto, refrescarAmortizacion } from "./detalle.ts";
import { ContextoDetalleAmortizacion, EstadoDetalleAmortizacion } from "./diseño.ts";

export const getMaquina: () => Maquina<EstadoDetalleAmortizacion, ContextoDetalleAmortizacion> = () => ({
    INICIAL: {
        amortizacion_id_cambiado: [cargarContexto],
        amortizacion_deseleccionada: [publicar("amortizacion_deseleccionada", null)],
    },

    ABIERTO: {
        amortizacion_guardada: [refrescarAmortizacion],
        borrado_solicitado: "BORRANDO",
        amortizacion_id_cambiado: [cargarContexto],
        amortizacion_deseleccionada: [publicar("amortizacion_deseleccionada", null)],
    },

    BORRANDO: {
        amortizacion_borrada: [publicar("amortizacion_borrada", null), "INICIAL"],
        borrado_cancelado: "ABIERTO",
    },
});
