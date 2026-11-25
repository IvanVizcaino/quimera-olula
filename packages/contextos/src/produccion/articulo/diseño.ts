import { Criteria, Entidad, RespuestaLista } from "@olula/lib/diseño.ts";

/** Componente de un artículo compuesto (`articuloscomp`) con la tarea del proceso en la que se consume. */
export interface ComponenteFabricacion extends Entidad {
    /** Id de la fila de `articuloscomp`, en texto. */
    id: string;
    articuloId: string;
    descripcion: string;
    cantidad: number;
    /** Vacío: sin tarea de consumo. */
    tareaProcesoId: string;
    tarea: string;
    codigoTarea: string;
    /** `articulos.porlotes` del componente. */
    porLotes: boolean;
}

/**
 * Fabricación de un artículo (`articulos.fabricado` e `idtipoproceso` de produccion3). En el
 * formulario `fabricado` llega como "true"/"false".
 */
export interface FabricacionArticulo extends Entidad {
    id: string;
    descripcion: string;
    fabricado: boolean | string;
    tipoProcesoId: string;
    tipoProceso: string;
    /** `articulos.porlotes`: un fabricado con componentes por lotes también tiene que ir por lotes. */
    porLotes: boolean;
    /** Solo en el detalle. */
    sinStock: boolean;
    componentes: ComponenteFabricacion[];
    /**
     * Lo que falta para poder fabricarlo (componentes sin tarea, tipo de proceso incompleto, que no
     * vaya por lotes teniendo componentes por lotes...).
     */
    avisos: string[];
}

export type CambiosFabricacion = Partial<Pick<FabricacionArticulo, "fabricado" | "tipoProcesoId">>;

export type GetFabricacionArticulo = (id: string) => Promise<FabricacionArticulo>;
export type GetFabricacionArticulos = (criteria: Criteria) => RespuestaLista<FabricacionArticulo>;
export type PatchFabricacionArticulo = (id: string, cambios: CambiosFabricacion) => Promise<void>;
export type PatchTareaComponente = (id: string, componenteId: string, tareaProcesoId: string | null) => Promise<void>;
