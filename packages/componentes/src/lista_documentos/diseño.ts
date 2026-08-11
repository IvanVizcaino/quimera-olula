import { Paginacion } from "@olula/lib/diseño.ts";

export interface QListaDocumentosProps {
    vinculoTipo: string;
    vinculoId: string;
    paginacion?: Paginacion;
    refreshCounter?: number;
    onError?: (error: Error) => void;
}
