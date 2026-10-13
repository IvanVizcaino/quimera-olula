import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { ListaEntidades } from "@olula/lib/ListaEntidades.js";
import { Inventario, LineaInventario, ResultadoRegularizacionInventario } from "../../diseño.ts";
import {
    cargarContexto,
    Lineas,
    onExportarCsv,
    onImportacionCsvCompletada,
    onInventarioCerrado,
    onLineaCreada,
    onRegularizacionCompletada,
    onRestoACeroCompletado,
} from "./detalle.ts";

export type EstadoDetalleInventario =
    | "INICIAL"
    | "ABIERTO"
    | "CREANDO_LINEA"
    | "REGULARIZANDO"
    | "RESTO_A_CERO"
    | "IMPORTANDO_CSV"
    | "CERRANDO";

export type ContextoDetalleInventario = {
    estado: EstadoDetalleInventario;
    inventario: Inventario;
    lineas: ListaEntidades<LineaInventario>;
    resultadoRegularizacion: ResultadoRegularizacionInventario | null;
};

export const getMaquina: () => Maquina<EstadoDetalleInventario, ContextoDetalleInventario> = () => ({
    INICIAL: {
        inventario_id_cambiado: [cargarContexto],
        inventario_deseleccionado: [publicar("inventario_deseleccionado", null)],
    },
    ABIERTO: {
        inventario_id_cambiado: [cargarContexto],
        alta_linea_solicitada: "CREANDO_LINEA",
        regularizar_solicitado: "REGULARIZANDO",
        resto_a_cero_solicitado: "RESTO_A_CERO",
        importar_csv_solicitado: "IMPORTANDO_CSV",
        cerrar_solicitado: "CERRANDO",
        exportar_csv_solicitado: [onExportarCsv],
        linea_seleccionada: [Lineas.activar],
    },
    CREANDO_LINEA: {
        linea_creada: [onLineaCreada, "ABIERTO"],
        alta_de_linea_cancelada: "ABIERTO",
    },
    REGULARIZANDO: {
        regularizacion_completada: [onRegularizacionCompletada],
        regularizacion_cancelada: "ABIERTO",
    },
    RESTO_A_CERO: {
        resto_a_cero_completado: [onRestoACeroCompletado],
        resto_a_cero_cancelado: "ABIERTO",
    },
    IMPORTANDO_CSV: {
        importacion_csv_completada: [onImportacionCsvCompletada],
        importacion_csv_cancelada: "ABIERTO",
    },
    CERRANDO: {
        inventario_cerrado: [onInventarioCerrado],
        cierre_inventario_cancelado: "ABIERTO",
    },
});
