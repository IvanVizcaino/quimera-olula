import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.js";
import { ContextoTarjetaPuntos, EstadoTarjetaPuntos } from "./diseño.ts";
import { cancelarEdicion, cargarContexto, refrescarTarjeta } from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoTarjetaPuntos, ContextoTarjetaPuntos> = () => ({
    INICIAL: {
        tarjeta_id_cambiada: [cargarContexto],
    },
    Editando: {
        tarjeta_guardada: [refrescarTarjeta],
        cancelar_edicion: cancelarEdicion,
        cancelar_seleccion: publicar("seleccion_cancelada"),
    },
});
