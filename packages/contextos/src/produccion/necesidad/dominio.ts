import { sinTexto } from "../comun/dominio.ts";
import { cantidadDesdeTexto, cantidadParaEditar } from "../orden/dominio.ts";
import {
    FilaGenerar,
    FilaPropuesta,
    FiltrosNecesidades,
    Necesidad,
    OrdenPropuesta,
    OrigenNecesidad,
} from "./diseño.ts";

/**
 * «Incluir componentes» (`chkGenerarCompuestos`) marcado al abrir el asistente. En Eneboo
 * hispanicfiber lo traía marcado; aquí va desmarcado (como el resto de Eneboo) y se cambia aquí.
 */
export const INCLUIR_COMPONENTES_POR_DEFECTO = false;

/** Filtros al abrir el asistente: buscar en pedidos, con «cantidad completa» de la configuración. */
export const filtrosNecesidadesIniciales = (
    incluirComponentes: boolean = INCLUIR_COMPONENTES_POR_DEFECTO,
): FiltrosNecesidades => ({
    enPedidos: true,
    pedidoCompleto: null,
    enStock: false,
    bajoMinimo: false,
    incluirComponentes,
    familiaId: "",
    referenciaDesde: "",
    referenciaHasta: "",
    pedidoId: "",
    clienteId: "",
    tipoFecha: "pedido",
    fechaDesde: "",
    fechaHasta: "",
});

export const ORIGENES: Record<OrigenNecesidad, string> = {
    pedido: "Pedido",
    stock: "Stock",
    componente: "Componente",
    manual: "Manual",
};

export const TIPOS_FECHA = [
    { valor: "pedido", descripcion: "Pedido" },
    { valor: "salida", descripcion: "Salida" },
];

const texto = (valor: string | null | undefined): string => (valor ?? "").trim();

/** Con pedido, cliente o fechas el servidor solo busca en pedidos (como Eneboo). */
export const filtraPorPedido = (f: FiltrosNecesidades): boolean =>
    !sinTexto(f.pedidoId) || !sinTexto(f.clienteId) || !sinTexto(f.fechaDesde) || !sinTexto(f.fechaHasta);

/** Por qué no se puede buscar con estos filtros, o `null`. */
export const motivoFiltrosNoValidos = (f: FiltrosNecesidades): string | null => {
    if (!f.enPedidos && !f.enStock && !f.bajoMinimo) return "Marca dónde buscar: en pedidos, en stock o bajo mínimo";
    if (!sinTexto(f.fechaDesde) && !sinTexto(f.fechaHasta) && f.fechaDesde > f.fechaHasta)
        return "La fecha desde no puede ser posterior a la fecha hasta";
    if (!sinTexto(f.referenciaDesde) && !sinTexto(f.referenciaHasta) && texto(f.referenciaDesde) > texto(f.referenciaHasta))
        return "La referencia desde no puede ser posterior a la referencia hasta";
    return null;
};

/** Cuerpo de `?q=` de `GET /produccion/necesidades`: las opciones siempre; los filtros, solo si tienen valor. */
export type FiltrosNecesidadesApi = {
    en_pedidos: boolean;
    en_stock: boolean;
    bajo_minimo: boolean;
    incluir_componentes: boolean;
    pedido_completo?: boolean;
    familia_id?: string;
    referencia_desde?: string;
    referencia_hasta?: string;
    pedido_id?: string;
    cliente_id?: string;
    tipo_fecha?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
};

export const filtrosNecesidadesAApi = (f: FiltrosNecesidades): FiltrosNecesidadesApi => {
    const api: FiltrosNecesidadesApi = {
        en_pedidos: f.enPedidos,
        // «Bajo mínimo» implica buscar en stock.
        en_stock: f.enStock || f.bajoMinimo,
        bajo_minimo: f.bajoMinimo,
        incluir_componentes: f.incluirComponentes,
    };
    if (f.pedidoCompleto !== null) api.pedido_completo = f.pedidoCompleto;
    const textos: [keyof FiltrosNecesidadesApi, string][] = [
        ["familia_id", f.familiaId],
        ["referencia_desde", f.referenciaDesde],
        ["referencia_hasta", f.referenciaHasta],
        ["pedido_id", f.pedidoId],
        ["cliente_id", f.clienteId],
        ["fecha_desde", f.fechaDesde],
        ["fecha_hasta", f.fechaHasta],
    ];
    for (const [campo, valor] of textos) {
        if (!sinTexto(valor)) (api as Record<string, unknown>)[campo] = texto(valor);
    }
    if (api.fecha_desde || api.fecha_hasta) api.tipo_fecha = f.tipoFecha;
    return api;
};

/** El `?q=` ya codificado. */
export const queryNecesidades = (f: FiltrosNecesidades): string =>
    `?q=${encodeURIComponent(JSON.stringify(filtrosNecesidadesAApi(f)))}`;

/** Cantidad con 3 decimales como mucho (para la propuesta editable y las sumas). */
export const redondear3 = (valor: number): number => Math.round(valor * 1000) / 1000;

/** «A fabricar» inicial: la propuesta del servidor con coma decimal. */
export const aFabricarInicial = (cantidad: number): string => cantidadParaEditar(redondear3(cantidad));

export const filaDesdeNecesidad = (necesidad: Necesidad, seleccionada = false): FilaPropuesta => ({
    necesidad,
    seleccionada,
    aFabricar: aFabricarInicial(necesidad.cantidad),
});

/**
 * Filas tras una búsqueda: las nuevas, conservando lo escrito y la selección de las que ya
 * estaban, y las líneas manuales al final (no salen de la búsqueda).
 */
export const filasTrasBuscar = (anteriores: FilaPropuesta[], necesidades: Necesidad[]): FilaPropuesta[] => {
    const previas = new Map(anteriores.map((f) => [f.necesidad.id, f]));
    const nuevas = necesidades.map((n) => {
        const previa = previas.get(n.id);
        return previa ? { necesidad: n, seleccionada: previa.seleccionada, aFabricar: previa.aFabricar } : filaDesdeNecesidad(n);
    });
    return [...nuevas, ...anteriores.filter((f) => f.necesidad.origen === "manual")];
};

/** Motivo por el que «A fabricar» no vale, o `null`. */
export const motivoAFabricarNoValido = (valor: string): string | null => {
    if (sinTexto(valor)) return "Indica la cantidad a fabricar";
    const numero = cantidadDesdeTexto(valor);
    if (numero === null) return "La cantidad ha de ser un número";
    if (numero <= 0) return "La cantidad ha de ser mayor que cero";
    if (Math.abs(Math.round(numero * 1000) - numero * 1000) > 1e-6) return "La cantidad admite como máximo 3 decimales";
    return null;
};

export const seleccionadas = (filas: FilaPropuesta[]): FilaPropuesta[] => filas.filter((f) => f.seleccionada);

/** Errores de las filas elegidas («Referencia: motivo»), para no mandar nada que el servidor rechace. */
export const erroresSeleccion = (filas: FilaPropuesta[]): string[] =>
    seleccionadas(filas).flatMap((f) => {
        const motivo = motivoAFabricarNoValido(f.aFabricar);
        return motivo ? [`${f.necesidad.articuloId}: ${motivo}`] : [];
    });

/** «A fabricar» de la fila si vale (número positivo con 3 decimales como mucho), o `null`. */
const cantidadValida = (f: FilaPropuesta): number | null =>
    motivoAFabricarNoValido(f.aFabricar) ? null : cantidadDesdeTexto(f.aFabricar);

/** Lo que se manda a `produccion.orden.generar`: las filas elegidas (con cantidad válida). */
export const filasAGenerar = (filas: FilaPropuesta[]): FilaGenerar[] =>
    seleccionadas(filas).flatMap((f) => {
        const cantidad = cantidadValida(f);
        if (cantidad === null) return [];
        return [{
            articuloId: f.necesidad.articuloId,
            cantidad,
            lineaPedidoId: f.necesidad.origen === "pedido" ? f.necesidad.lineaPedidoId : "",
        }];
    });

/**
 * Resumen de lo que se generará: una orden por artículo con la suma de sus filas, en el orden
 * en que aparecen (el criterio del servidor, `criterio_agrupacion`, es la referencia).
 */
export const ordenesPropuestas = (filas: FilaPropuesta[]): OrdenPropuesta[] => {
    const porArticulo = new Map<string, OrdenPropuesta>();
    for (const fila of seleccionadas(filas)) {
        const cantidad = cantidadValida(fila);
        if (cantidad === null) continue;
        const n = fila.necesidad;
        const orden = porArticulo.get(n.articuloId)
            ?? { articuloId: n.articuloId, descripcion: n.descripcion, cantidad: 0, filas: 0, pedidos: [], lanzable: true };
        orden.cantidad = redondear3(orden.cantidad + cantidad);
        orden.filas += 1;
        if (n.pedidoId && !orden.pedidos.includes(n.pedidoId)) orden.pedidos.push(n.pedidoId);
        orden.lanzable = orden.lanzable && n.lanzable;
        if (!orden.descripcion && n.descripcion) orden.descripcion = n.descripcion;
        porArticulo.set(n.articuloId, orden);
    }
    return [...porArticulo.values()];
};

/** Artículos de la propuesta que no se pueden lanzar (sin tipo de proceso o incompleto). */
export const noLanzables = (ordenes: OrdenPropuesta[]): string[] =>
    ordenes.filter((o) => !o.lanzable).map((o) => o.articuloId);

/** Estado del check «seleccionar todo»: todas, ninguna o algunas. */
export const estadoSeleccion = (filas: FilaPropuesta[]): "todas" | "ninguna" | "algunas" => {
    const n = seleccionadas(filas).length;
    if (n === 0) return "ninguna";
    return n === filas.length ? "todas" : "algunas";
};

export const seleccionarTodas = (filas: FilaPropuesta[], seleccionada: boolean): FilaPropuesta[] =>
    filas.map((f) => (f.seleccionada === seleccionada ? f : { ...f, seleccionada }));

export const cambiarFila = (filas: FilaPropuesta[], id: string, cambio: Partial<Omit<FilaPropuesta, "necesidad">>): FilaPropuesta[] =>
    filas.map((f) => (f.necesidad.id === id ? { ...f, ...cambio } : f));

/** Orden de la rejilla (`orden` del asistente de Eneboo: Cliente, Referencia, Seleccionados). */
export type OrdenRejilla = "busqueda" | "cliente" | "referencia" | "seleccionadas";

export const ORDENES_REJILLA: { valor: OrdenRejilla; descripcion: string }[] = [
    { valor: "busqueda", descripcion: "Como llegan" },
    { valor: "cliente", descripcion: "Cliente" },
    { valor: "referencia", descripcion: "Referencia" },
    { valor: "seleccionadas", descripcion: "Seleccionadas primero" },
];

export const ordenarFilas = (filas: FilaPropuesta[], orden: OrdenRejilla): FilaPropuesta[] => {
    const clave = (f: FilaPropuesta): string => {
        switch (orden) {
            case "cliente": return `${f.necesidad.cliente || "￿"}|${f.necesidad.articuloId}`;
            case "referencia": return f.necesidad.articuloId;
            case "seleccionadas": return f.seleccionada ? "0" : "1";
            default: return "";
        }
    };
    if (orden === "busqueda") return filas;
    // Estable: a igual clave, como llegan.
    return filas
        .map((f, i) => ({ f, i, k: clave(f) }))
        .sort((a, b) => a.k.localeCompare(b.k, "es") || a.i - b.i)
        .map(({ f }) => f);
};

/** Fila de «Crear línea»: un artículo fabricado a mano, elegida y sin pedido. */
export const necesidadManual = (
    articulo: { id: string; descripcion: string; tipoProcesoId: string },
    cantidad: number,
    numero: number,
): FilaPropuesta => ({
    seleccionada: true,
    aFabricar: aFabricarInicial(cantidad),
    necesidad: {
        id: `manual:${numero}`,
        origen: "manual",
        pedidoId: "", lineaPedidoId: "", clienteId: "", cliente: "", fechaPedido: "", fechaSalida: "",
        articuloId: articulo.id,
        descripcion: articulo.descripcion,
        tipoProcesoId: articulo.tipoProcesoId,
        pendiente: null, cubierta: 0, existencias: 0, disponible: 0, porRecibir: 0, aFaltas: null,
        stockMinimo: 0, stockMaximo: 0, cantidadNecesaria: null, compuestos: [],
        cantidad,
        lotes: [], ordenesAbiertas: [],
        avisos: articulo.tipoProcesoId ? [] : ["El artículo no tiene tipo de proceso: la orden no se podrá lanzar"],
        // Sin la consulta no se sabe si el tipo está completo: si no lo está, el servidor da 409 al lanzar.
        lanzable: !!articulo.tipoProcesoId,
    },
});

/** Resumen de stock de la fila para la ayuda contextual de «Existencias». */
export const ayudaStock = (n: Necesidad): string =>
    [
        `Disponible ${n.disponible}`,
        `por recibir ${n.porRecibir}`,
        n.aFaltas !== null ? `a faltas ${n.aFaltas}` : null,
        `mínimo ${n.stockMinimo}`,
        `máximo ${n.stockMaximo}`,
    ].filter(Boolean).join(" · ");
