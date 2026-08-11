import { Maquina } from "@olula/lib/diseño.js";
import { ContextoArbolDocumentos, EstadoArbolDocumentos } from "./diseño.ts";
import { cargarArbol, seleccionarCarpetaPadre } from "./dominio.ts";

export const getMaquinaArbolDocumentos: () => Maquina<EstadoArbolDocumentos, ContextoArbolDocumentos> = () => {
    return {
        cargando: {
            cargar_arbol: [cargarArbol, "cargado"],
        },
        cargado: {
            cargar_arbol: [cargarArbol, "cargado"],
            recargar_solicitado: [cargarArbol, "cargado"],
            creacion_carpeta_solicitada: [seleccionarCarpetaPadre, "creando_carpeta"],
            adicion_documento_solicitada: [seleccionarCarpetaPadre, "anadiendo_documento"],
        },
        creando_carpeta: {
            cargar_arbol: [cargarArbol, "cargado"],
            carpeta_creada: [cargarArbol, "cargado"],
            creacion_carpeta_cancelada: "cargado",
        },
        anadiendo_documento: {
            cargar_arbol: [cargarArbol, "cargado"],
            documento_anadido: [cargarArbol, "cargado"],
            adicion_documento_cancelada: "cargado",
        },
    };
};
