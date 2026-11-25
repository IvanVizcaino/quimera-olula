import { Entidad } from "@olula/lib/diseño.ts";
import { OrdenProduccion } from "../orden/diseño.ts";

/**
 * Asistente «Generar órdenes de producción» (F6, `pr_generarordenesprod` de Eneboo): la consulta
 * de necesidades propone qué fabricar y el comando `produccion.orden.generar` crea las órdenes
 * de las filas elegidas de golpe.
 */

/** De dónde sale la necesidad: una línea de pedido, reponer stock o un semielaborado. */
export type OrigenNecesidad = "pedido" | "stock" | "componente" | "manual";

/** Qué fecha del pedido filtra el rango. */
export type TipoFechaNecesidad = "pedido" | "salida";

/** Un lote que ya cubre parte de la línea de pedido. */
export interface LoteNecesidad {
    loteId: string;
    ordenId: string;
    cantidad: number;
}

/** Una fila de la propuesta. Fechas "AAAA-MM-DD" o vacías; textos vacíos si no hay. */
export interface Necesidad extends Entidad {
    /** `pedido:<idlinea>`, `stock:<ref>`, `componente:<ref>` o `manual:<n>` (las de «Crear línea»). */
    id: string;
    origen: OrigenNecesidad;
    pedidoId: string;
    lineaPedidoId: string;
    clienteId: string;
    cliente: string;
    fechaPedido: string;
    fechaSalida: string;
    articuloId: string;
    descripcion: string;
    tipoProcesoId: string;
    /** Pedido: lo pendiente de servir menos lo ya cubierto; `null` en stock y componentes. */
    pendiente: number | null;
    cubierta: number;
    existencias: number;
    disponible: number;
    porRecibir: number;
    /** `null` sin el plugin de reservas de stock. */
    aFaltas: number | null;
    stockMinimo: number;
    stockMaximo: number;
    /** Componente: la cantidad teórica para lo que lo usa. */
    cantidadNecesaria: number | null;
    /** Componente: los artículos que lo usan. */
    compuestos: string[];
    /** Propuesta a fabricar. */
    cantidad: number;
    lotes: LoteNecesidad[];
    ordenesAbiertas: string[];
    avisos: string[];
    /** Tiene tipo de proceso completo: su orden se podrá lanzar. */
    lanzable: boolean;
}

/** Los filtros y opciones del asistente (el `?q=` de la consulta, en camelCase). */
export interface FiltrosNecesidades {
    enPedidos: boolean;
    /** «Cantidad completa del pedido»; `null`: la de la configuración de producción. */
    pedidoCompleto: boolean | null;
    enStock: boolean;
    bajoMinimo: boolean;
    incluirComponentes: boolean;
    familiaId: string;
    referenciaDesde: string;
    referenciaHasta: string;
    pedidoId: string;
    clienteId: string;
    tipoFecha: TipoFechaNecesidad;
    fechaDesde: string;
    fechaHasta: string;
}

export interface RespuestaNecesidades {
    datos: Necesidad[];
    total: number;
    /** El modo con que el servidor ha calculado lo de pedidos. */
    pedidoCompleto: boolean;
    almacenId: string;
    /** La BD tiene reservas a faltas (plugin `asignacion_reservas_stock`). */
    aFaltas: boolean;
}

/** Una fila de la rejilla: la necesidad, si está elegida y lo que se fabricará (texto editable). */
export interface FilaPropuesta {
    necesidad: Necesidad;
    seleccionada: boolean;
    /** «A fabricar» tal como se escribe (coma decimal). */
    aFabricar: string;
}

/** Lo que se mandará al servidor por cada fila elegida. */
export interface FilaGenerar {
    articuloId: string;
    cantidad: number;
    /** Vacía en stock, componentes y líneas manuales. */
    lineaPedidoId: string;
}

/** Una orden de la propuesta: un artículo con la suma de sus filas (`criterioAgrupacionOP`). */
export interface OrdenPropuesta {
    articuloId: string;
    descripcion: string;
    cantidad: number;
    filas: number;
    /** Códigos de pedido de sus filas, sin repetir. */
    pedidos: string[];
    /** Todas sus filas se pueden lanzar. */
    lanzable: boolean;
}

export interface PeticionGenerar {
    filas: FilaGenerar[];
    lanzar: boolean;
    /** Vacía: la pone el servidor (hoy + 20 días). */
    fechaFabricacion: string;
}

export interface OrdenesGeneradas {
    ordenes: OrdenProduccion[];
    /** Procesos lanzados (vacío sin «lanzar»). */
    procesos: number;
}

export type GetNecesidades = (filtros: FiltrosNecesidades) => Promise<RespuestaNecesidades>;
export type PostGenerarOrdenes = (peticion: PeticionGenerar) => Promise<OrdenesGeneradas>;
