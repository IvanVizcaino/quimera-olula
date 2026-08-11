import { DocumentosAPI, filtroVinculoDocumentos } from "@olula/lib/api/documentos.ts";
import { ProcesarContexto } from "@olula/lib/diseño.js";
import { ContextoGestorDocumentos, EstadoGestorDocumentos } from "./diseño.ts";

type ProcesarGestorDocumentos = ProcesarContexto<EstadoGestorDocumentos, ContextoGestorDocumentos>;

export const cargarDocumentos: ProcesarGestorDocumentos = async (contexto) => {
    try {
        const filtro = filtroVinculoDocumentos(
            contexto.configuracion.vinculoTipo,
            contexto.configuracion.vinculoId
        );

        const resultado = await DocumentosAPI.obtener(
            filtro,
            [],
            { limite: 50, pagina: 1 }
        );

        return {
            ...contexto,
            documentos: resultado.datos,
            archivosSeleccionados: [],
            cargando: false,
        };
    } catch (error) {
        console.error("cargarDocumentos - error", error);
        throw error;
    }
};

export const agregarArchivosSeleccionados: ProcesarGestorDocumentos = async (contexto, payload) => {
    const archivosNuevos = payload as File[];

    return {
        ...contexto,
        archivosSeleccionados: [...contexto.archivosSeleccionados, ...archivosNuevos],
    };
};

export const superaTamanioMaximo = (archivo: File, tamanioMaximoBytes?: number): boolean =>
    tamanioMaximoBytes !== undefined && archivo.size > tamanioMaximoBytes;

export const eliminarArchivoSeleccionado: ProcesarGestorDocumentos = async (contexto, payload) => {
    const indice = payload as number;

    return {
        ...contexto,
        archivosSeleccionados: contexto.archivosSeleccionados.filter((_, i) => i !== indice),
    };
};
