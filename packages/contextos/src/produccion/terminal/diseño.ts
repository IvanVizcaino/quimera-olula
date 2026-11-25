import { TareaProduccion } from "../tarea/diseño.ts";

/** Operario leído por código (`GET /produccion/trabajador/codigo/<codigo>`). */
export interface TrabajadorLeido {
    codigo: string;
    existe: boolean;
    nombre: string;
    deBaja: boolean;
}

/** Configuración del puesto (`GET /produccion/terminal/config`). */
export interface ConfigTerminal {
    usarTramos: boolean;
    mostrarFormulario: boolean;
    controlTiempo: boolean;
    /** Decimales de la cantidad de un tramo. */
    decimales: number;
    /** Máximo de un tramo (`null`, sin máximo). */
    maximoTramo: number | null;
    permiteDeshacer: boolean;
}

/** Tarea del Terminal: la de F5 con lo declarado (Σ tramos) y la unidad de tiempo. */
export interface TareaTerminal extends TareaProduccion {
    cantidadHecha: number;
    unidad: string;
}

export interface LoteConsumidoTerminal {
    loteId: string;
    cantidad: number;
    tramoId: string;
}

/** Componente que se consume en la tarea (pantalla de consumos). */
export interface ComponenteTerminal {
    /** `articuloscomp.id`: el que se manda en `consumos`. */
    componenteId: string;
    articuloId: string;
    descripcion: string;
    /** Por unidad fabricada. */
    cantidadUnidad: number;
    /** Para todo el lote. */
    previsto: number;
    consumido: number;
    pendiente: number;
    porLotes: boolean;
    /** Porcentaje mínimo de lo previsto del tramo si no se cierra. */
    minimo: number;
    puedeCerrar: boolean;
    lotes: LoteConsumidoTerminal[];
}

/** Pantalla de consumos de una tarea (`GET /produccion/terminal/tarea/<id>/consumos`). */
export interface ConsumosTarea {
    id: string;
    estado: string;
    codigo: string;
    descripcion: string;
    final: boolean;
    procesoId: string;
    ordenId: string;
    loteId: string;
    articuloId: string;
    articulo: string;
    cantidadPrevista: number;
    cantidadHecha: number;
    cantidadPendiente: number;
    unidad: string;
    componentes: ComponenteTerminal[];
}

export interface MovimientoTramo {
    /** Vacío en la entrada del producto. */
    componenteId: string;
    articuloId: string;
    loteId: string;
    /** Positiva en la entrada, negativa en un consumo. */
    cantidad: number;
}

/** Tramo declarado de una tarea (`GET /produccion/terminal/tarea/<id>/tramos`). */
export interface TramoTerminal {
    id: string;
    tareaId: string;
    trabajadorId: string;
    trabajador: string;
    cantidad: number;
    diaInicio: string;
    tiempoInicio: string;
    diaFin: string;
    tiempoFin: string;
    movimientos: MovimientoTramo[];
}

/** Lote leído por código (`GET /produccion/terminal/lote/<codigo>?tarea=`). */
export interface LoteLeido {
    id: string;
    articuloId: string;
    articulo: string;
    caducidad: string;
    enAlmacen: number;
    disponible: number;
    porLotes: boolean;
    /** El componente de la tarea que es su artículo (vacío si no lo es). */
    componenteId: string;
}

/** Lote leído en una línea de la pantalla de consumos (la cantidad, como se teclea). */
export interface LoteLinea {
    loteId: string;
    cantidad: string;
}

/** Línea de la pantalla de consumos: el componente y lo que se declara de él en el tramo. */
export interface LineaConsumo {
    componente: ComponenteTerminal;
    /** Sin lotes: lo consumido; `null` sigue a lo previsto del tramo. */
    cantidad: string | null;
    /** Por lotes: los leídos. */
    lotes: LoteLinea[];
    cerrado: boolean;
}

export interface ConsumoApi {
    componente_id: string;
    lotes?: { lote_id: string; cantidad: number }[];
    cantidad?: number;
    cerrado?: boolean;
}

export interface CuerpoDeclarar {
    cantidad: number;
    trabajador_id?: string;
    terminar?: boolean;
    consumos: ConsumoApi[];
}

export type CuerpoEditarTramo = Omit<CuerpoDeclarar, "terminar">;
