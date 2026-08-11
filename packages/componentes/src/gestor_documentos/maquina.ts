import { Maquina } from "@olula/lib/diseño.js";
import { ContextoGestorDocumentos, EstadoGestorDocumentos } from "./diseño.ts";
import { agregarArchivosSeleccionados, cargarDocumentos, eliminarArchivoSeleccionado } from "./dominio.ts";

export const getMaquinaGestorDocumentos: () => Maquina<EstadoGestorDocumentos, ContextoGestorDocumentos> = () => {
    return {
        lista: {
            cargar_documentos: cargarDocumentos,
            archivos_seleccionados: [agregarArchivosSeleccionados, "archivos-seleccionados"],
        },
        "archivos-seleccionados": {
            archivos_seleccionados: [agregarArchivosSeleccionados, "archivos-seleccionados"],
            archivo_eliminado: [eliminarArchivoSeleccionado, "archivos-seleccionados"],
            subida_cancelada: "lista",
            subir_archivos_solicitado: "subiendo",
        },
        subiendo: {
            documentos_subidos: [cargarDocumentos, "lista"],
            subida_cancelada: "lista",
        },
    };
};
