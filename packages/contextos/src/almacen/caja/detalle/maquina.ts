import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.js";
import { ContextoCaja, EstadoCaja } from "./diseño.ts";
import { cargarContexto, refrescarCaja } from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoCaja, ContextoCaja> = () => ({
    INICIAL: {
        caja_id_cambiado: [cargarContexto],

        caja_deseleccionada: [
            publicar("caja_deseleccionada", null),
        ],
    },
    ABIERTO: {
        caja_guardada: [refrescarCaja],

        borrado_solicitado: "BORRANDO",

        caja_id_cambiado: [cargarContexto],
    },
    BORRANDO: {
        caja_borrada: [
            publicar("caja_borrada", null),
            "INICIAL",
        ],

        borrado_cancelado: "ABIERTO",
    },
});
