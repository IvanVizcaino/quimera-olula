import { NodoArbol } from "@olula/lib/api/documentos.ts";
import { Contexto } from "@olula/lib/diseño.ts";

export type ConfiguracionArbolDocumentos = {
    tipoObjeto: string;
    objetoId: string;
};

export type EstadoArbolDocumentos = "cargando" | "cargado" | "creando_carpeta" | "anadiendo_documento";

export type ContextoArbolDocumentos = Contexto<EstadoArbolDocumentos> & {
    nodos: NodoArbol[];
    configuracion: ConfiguracionArbolDocumentos;
    carpetaPadreId: string | null;
};
