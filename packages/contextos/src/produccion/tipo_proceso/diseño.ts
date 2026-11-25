import { Criteria, Entidad, Modelo, RespuestaLista } from "@olula/lib/diseño.ts";

export type UnidadTiempo = "Segundos" | "Minutos" | "Horas" | "Días";
export type TipoProduccion = "Fabricación" | "Modificación";

/** Tarea de un tipo de proceso (`pr_tipostareapro`). `id` es el serial de Eneboo, en texto. */
export interface TareaProceso extends Entidad {
    id: string;
    tipoTareaId: string;
    /** Descripción del tipo de tarea (solo lectura). */
    tipoTarea: string;
    descripcion: string;
    orden: number;
    /** `<tipo de proceso>_<tipo de tarea>`; lo pone el servidor y no cambia. */
    codigo: string;
    inicial: boolean;
    final: boolean;
    terminaEnUnPaso: boolean;
    verificarConsumos: boolean;
    opcional: boolean;
}

/** Tarea de la lista de todas las tareas de proceso (`GET /produccion/tarea_proceso`). */
export interface TareaProcesoItem extends TareaProceso {
    tipoProcesoId: string;
    /** Descripción del tipo de proceso. */
    tipoProceso: string;
}

/** Secuencia entre dos tareas del tipo de proceso (`pr_secuencias`); se identifica por el par inicio-fin. */
export interface Secuencia extends Entidad {
    id: string;
    tareaInicioId: string;
    codigoInicio: string;
    descripcionInicio: string;
    tareaFinId: string;
    codigoFin: string;
    descripcionFin: string;
    requerida: boolean;
}

/** Tipo de proceso (`pr_tiposproceso`). Los checkboxes llegan del formulario como "true"/"false". */
export interface TipoProceso extends Entidad {
    id: string;
    descripcion: string;
    /** Segundos. */
    tiempoMedio: number | null;
    /** `tiempoMedio` en `unidad` (lo calcula el servidor). */
    tiempoUnidad: number | null;
    unidad: UnidadTiempo;
    tipoProduccion: TipoProduccion;
    generarTodas: boolean | string;
    secuencial: boolean | string;
    fabricacion: boolean | string;
    /** Solo en el detalle; vacías en la lista. */
    tareas: TareaProceso[];
    secuencias: Secuencia[];
    /** Solo en el detalle (la consulta por id): si tiene tarea inicial y final y las secuencias las enlazan. */
    completo: boolean;
    motivosIncompleto: string[];
}

export interface NuevoTipoProceso extends Modelo {
    id: string;
    descripcion: string;
    unidad: UnidadTiempo;
    tipoProduccion: TipoProduccion;
    fabricacion: boolean | string;
    secuencial: boolean | string;
}

export type CambiosTipoProceso = Partial<Pick<TipoProceso,
    "descripcion" | "tiempoMedio" | "unidad" | "tipoProduccion" | "generarTodas" | "secuencial" | "fabricacion">>;

/** Formulario de alta o cambio de una tarea del tipo de proceso. */
export interface FormTareaProceso extends Modelo {
    tipoTareaId: string;
    descripcion: string;
    /** Vacío al añadir: la última. */
    orden: number | null;
    inicial: boolean | string;
    final: boolean | string;
    terminaEnUnPaso: boolean | string;
    verificarConsumos: boolean | string;
    opcional: boolean | string;
}

export interface CopiaTipoProceso extends Modelo {
    nuevoId: string;
    descripcion: string;
}

export type GetTipoProceso = (id: string) => Promise<TipoProceso>;
export type GetTiposProceso = (criteria: Criteria) => RespuestaLista<TipoProceso>;
export type GetTareasProceso = (criteria: Criteria) => RespuestaLista<TareaProcesoItem>;
export type PostTipoProceso = (nuevo: NuevoTipoProceso) => Promise<string>;
export type PatchTipoProceso = (id: string, cambios: CambiosTipoProceso) => Promise<void>;
export type DeleteTipoProceso = (id: string) => Promise<void>;
export type CopiarTipoProceso = (id: string, copia: CopiaTipoProceso) => Promise<string>;
export type PostTareaProceso = (id: string, tarea: FormTareaProceso) => Promise<void>;
export type PatchTareaProceso = (id: string, tareaId: string, tarea: FormTareaProceso) => Promise<void>;
export type DeleteTareaProceso = (id: string, tareaId: string) => Promise<void>;
export type PostSecuencia = (id: string, inicioId: string, finId: string, requerida: boolean) => Promise<void>;
export type DeleteSecuencia = (id: string, inicioId: string, finId: string) => Promise<void>;
