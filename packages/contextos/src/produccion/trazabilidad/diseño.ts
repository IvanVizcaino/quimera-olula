import { Entidad } from "@olula/lib/diseño.ts";

/**
 * Trazabilidad de lotes (`/produccion/trazabilidad/lote/<id>/...`, regla
 * `produccion.trazabilidad`). Solo movimientos HECHO de `movistock`.
 */

/** Origen de un movimiento de un lote, por la columna que lo enlaza. */
export type TipoMovimientoLote =
    | "albaran_compra"
    | "factura_compra"
    | "albaran_venta"
    | "factura_venta"
    | "produccion"
    | "transferencia"
    | "otro";

/** Movimiento HECHO de un lote con su documento. Fechas "AAAA-MM-DD"; vacíos en texto. */
export interface MovimientoLote extends Entidad {
    id: string;
    loteId: string;
    articuloId: string;
    tipo: TipoMovimientoLote | string;
    entrada: boolean;
    /** Con su signo: positiva la entrada, negativa la salida. */
    cantidad: number;
    fecha: string;
    hora: string;
    concepto: string;
    almacenId: string;
    /** `idalbaran`, `idfactura` o `idtrans` según el tipo. */
    documentoId: string;
    /** Código del albarán o la factura. */
    codigo: string;
    /** Proveedor en las compras, cliente en las ventas. */
    terceroId: string;
    tercero: string;
    procesoId: string;
    ordenId: string;
    /** En un consumo de producción, el lote que se fabrica. */
    loteProducidoId: string;
    tareaId: string;
}

/** Consumo de producción: `cantidad` (en positivo) de `loteId` para fabricar `loteProducidoId`. */
export interface ConsumoLote {
    id: string;
    /** Vacío si el componente no va por lotes. */
    loteId: string;
    loteProducidoId: string;
    articuloId: string;
    articulo: string;
    cantidad: number;
    fecha: string;
    tareaId: string;
    tareaProcesoId: string;
    /** Descripción de la tarea del tipo de proceso. */
    tarea: string;
    tramoId: string;
    procesoId: string;
    ordenId: string;
}

export interface DatosLoteTrazado {
    loteId: string;
    articuloId: string;
    articulo: string;
    caducidad: string;
    /** Orden de producción que lo fabrica (si es un lote producido). */
    ordenId: string;
    fechaFabricacion: string;
    clienteId: string;
}

export type SentidoTrazabilidad = "atras" | "adelante";

/**
 * Un lote del recorrido. Hacia atrás, `documentos` son sus compras y `consumos` lo que se
 * consumió para fabricarlo; hacia delante, sus ventas y dónde se consumió.
 */
export interface LoteTrazado extends DatosLoteTrazado {
    /** 0 el consultado. */
    nivel: number;
    /** Falso si los movimientos lo nombran pero no está en `lotes`. */
    existe: boolean;
    documentos: MovimientoLote[];
    consumos: ConsumoLote[];
}

export interface ClienteTrazado {
    clienteId: string;
    cliente: string;
    /** Lotes del recorrido que se le vendieron. */
    lotes: string[];
}

export interface Trazabilidad {
    sentido: SentidoTrazabilidad;
    loteId: string;
    niveles: number;
    /** Quedaban más niveles de los que recorre el servidor. */
    truncado: boolean;
    /** Por nivel y código, una vez cada uno. */
    lotes: LoteTrazado[];
    /** Solo hacia delante. */
    clientes: ClienteTrazado[];
}

export interface EntradasSalidasLote extends DatosLoteTrazado {
    entradas: number;
    /** En positivo. */
    salidas: number;
    saldo: number;
    /** Por fecha y alta. */
    movimientos: MovimientoLote[];
}

/**
 * Cómo se une un lote con su padre en el árbol: los consumos agrupados (hacia atrás, del lote
 * de materia prima; hacia delante, del lote consultado en el producido).
 */
export interface EnlaceArbol {
    cantidad: number;
    /** Tareas en las que se consumió (descripción o código), sin repetir. */
    tareas: string[];
    ordenes: string[];
    fecha: string;
}

/** Fila del árbol dibujado como lista indentada. */
export interface FilaArbol {
    clave: string;
    profundidad: number;
    loteId: string;
    /** `null` en un componente sin lote o en un lote que el servidor no ha devuelto. */
    lote: LoteTrazado | null;
    /** Componente que no va por lotes (solo hacia atrás). */
    sinLote: { articuloId: string; articulo: string } | null;
    /** `null` en la raíz. */
    enlace: EnlaceArbol | null;
    /** El lote ya salió más arriba: no se repiten sus ramas. */
    repetido: boolean;
}

export type GetTrazabilidad = (loteId: string, sentido: SentidoTrazabilidad) => Promise<Trazabilidad>;
export type GetEntradasSalidasLote = (loteId: string) => Promise<EntradasSalidasLote>;
