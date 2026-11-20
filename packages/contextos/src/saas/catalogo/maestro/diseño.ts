import { AjustesSaas, Catalogo, ExtraCatalogo, LimiteCatalogo, ModuloCatalogo } from "../diseño.js";

export type EstadoMaestroCatalogo =
    | 'INICIAL'
    | 'EDITANDO_MODULO'
    | 'EDITANDO_LIMITE'
    | 'BORRANDO_LIMITE'
    | 'EDITANDO_EXTRA'
    | 'BORRANDO_EXTRA';

export type ContextoMaestroCatalogo = {
    estado: EstadoMaestroCatalogo;
    catalogo: Catalogo | null;
    ajustes: AjustesSaas | null;
    /** Elemento sobre el que actúa el modal abierto. En el alta de límites y extras es null. */
    modulo: ModuloCatalogo | null;
    limite: LimiteCatalogo | null;
    extra: ExtraCatalogo | null;
};
