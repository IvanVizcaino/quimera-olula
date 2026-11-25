import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { ContextoDetalleInventario, EstadoDetalleInventario } from "./diseño.ts";
import { activarLinea, cargarContexto, conLineaActiva, refrescarInventario } from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoDetalleInventario, ContextoDetalleInventario> = () => ({
    INICIAL: {
        inventario_id_cambiado: [cargarContexto],
        inventario_deseleccionado: [publicar("inventario_deseleccionado", null)],
    },
    ABIERTO: {
        inventario_id_cambiado: [cargarContexto],
        inventario_deseleccionado: [publicar("inventario_deseleccionado", null)],
        inventario_guardado: [refrescarInventario],
        borrado_solicitado: "BORRANDO",
        linea_seleccionada: [activarLinea],
        crear_linea_solicitado: "CREANDO_LINEA",
        cambio_linea_solicitado: [conLineaActiva("CAMBIANDO_LINEA")],
        borrar_linea_solicitado: [conLineaActiva("BORRANDO_LINEA")],
        cargar_fichero_solicitado: "CARGANDO_FICHERO",
        regularizar_resto_solicitado: "REGULARIZANDO_RESTO",
    },
    BORRANDO: {
        inventario_borrado: [publicar("inventario_borrado", (ctx) => ctx.inventario.id), "INICIAL"],
        borrado_cancelado: "ABIERTO",
    },
    CREANDO_LINEA: {
        linea_creada: [refrescarInventario],
        alta_de_linea_cancelada: "ABIERTO",
    },
    CAMBIANDO_LINEA: {
        linea_cambiada: [refrescarInventario],
        cambio_de_linea_cancelado: "ABIERTO",
    },
    BORRANDO_LINEA: {
        linea_borrada: [refrescarInventario],
        borrado_de_linea_cancelado: "ABIERTO",
    },
    CARGANDO_FICHERO: {
        fichero_cargado: [refrescarInventario],
        carga_de_fichero_cancelada: "ABIERTO",
    },
    REGULARIZANDO_RESTO: {
        resto_regularizado: [refrescarInventario],
        regularizacion_resto_cancelada: "ABIERTO",
    },
});
