import { DocumentoGenerico } from "@olula/lib/api/documentos.ts";
import { Contexto } from "@olula/lib/diseño.ts";

export type ConfiguracionGestorDocumentos = {
    vinculoTipo: string;
    vinculoId: string;
    tipoDocumento?: string;
    tamanioMaximoBytes?: number;
};

export type EstadoGestorDocumentos = "lista" | "archivos-seleccionados" | "subiendo";

export type ContextoGestorDocumentos = Contexto<EstadoGestorDocumentos> & {
    documentos: DocumentoGenerico[];
    cargando: boolean;
    configuracion: ConfiguracionGestorDocumentos;
    archivosSeleccionados: File[];
};
