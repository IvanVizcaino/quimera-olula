import { ClausulaFiltro } from "@olula/lib/diseño.ts";
import { plugin } from "@olula/lib/dominio.ts";
import {
    CandidatoConciliacion,
    CandidatoListaConciliacion,
    Conciliacion,
    EstadoMovimientoBancario,
    ItemConciliacion,
    MovimientoBancario,
    OrigenConciliacionMovimiento,
    PartidaHuerfana,
    RemesaCandidata,
    TipoConciliacion,
    TipoFiltroCandidato,
    TipoReciboMovimiento,
} from "./diseño.ts";

export const movimientoBancarioVacio: MovimientoBancario = {
    id: "",
    conexionId: "",
    institucionNombre: null,
    cuentaConexionId: "",
    nombreCuenta: "",
    cuentaBancoId: null,
    descripcionCuentaBanco: null,
    idExterno: "",
    fecha: new Date(0),
    fechaValor: null,
    importe: 0,
    divisa: null,
    concepto: "",
    contraparte: null,
    referencia: null,
    pendiente: false,
    estado: "pendiente",
    numConciliaciones: 0,
    probabilidadMaxima: null,
    numItemsConciliacion: 0,
    probabilidad: null,
    origenConciliacion: null,
    justificacion: null,
    conciliadoPor: null,
    conciliadoEn: null,
    eliminadoEnBanco: false,
    requiereRevision: false,
    subcuentaBancoId: null,
    saldo: null,
};

export const ESTADOS_MOVIMIENTO_BANCARIO: EstadoMovimientoBancario[] = [
    "pendiente",
    "candidatos",
    "conciliado",
    "ignorado",
];

/** Vista por defecto del maestro: se ocultan los ya resueltos (conciliados/ignorados). */
export const ESTADOS_MOVIMIENTO_BANCARIO_DEFECTO: EstadoMovimientoBancario[] = [
    "pendiente",
    "candidatos",
];

export const ETIQUETA_ESTADO_MOVIMIENTO_BANCARIO: Record<EstadoMovimientoBancario, string> = {
    pendiente: "Pendiente",
    candidatos: "Candidatos",
    conciliado: "Conciliado",
    ignorado: "Ignorado",
};

type VarianteEtiqueta = "exito" | "error" | "advertencia" | "primario" | "gris";

/** Conciliado en verde, con candidatos en naranja y pendiente en rojo. */
export const VARIANTE_ESTADO_MOVIMIENTO_BANCARIO: Record<EstadoMovimientoBancario, VarianteEtiqueta> = {
    pendiente: "error",
    candidatos: "advertencia",
    conciliado: "exito",
    ignorado: "gris",
};

export const etiquetaEstadoMovimientoBancario = (estado: EstadoMovimientoBancario): string =>
    ETIQUETA_ESTADO_MOVIMIENTO_BANCARIO[estado];

/** Etiqueta de la lista: con candidatos, cuántos hay. */
export const etiquetaEstadoConConciliaciones = (movimiento: MovimientoBancario): string =>
    movimiento.estado === "candidatos" && movimiento.numConciliaciones > 0
        ? `${movimiento.numConciliaciones} candidato${movimiento.numConciliaciones === 1 ? "" : "s"}`
        : etiquetaEstadoMovimientoBancario(movimiento.estado);

export const varianteEstadoMovimientoBancario = (estado: EstadoMovimientoBancario): VarianteEtiqueta =>
    VARIANTE_ESTADO_MOVIMIENTO_BANCARIO[estado];

export const opcionesEstadoMovimientoBancario = ESTADOS_MOVIMIENTO_BANCARIO.map((estado) => ({
    valor: estado,
    descripcion: etiquetaEstadoMovimientoBancario(estado),
}));

const comoLista = (valor: unknown): string[] =>
    Array.isArray(valor)
        ? valor.map(String).filter(Boolean)
        : typeof valor === "string"
            ? valor.split(",").map((v) => v.trim()).filter(Boolean)
            : [];

export const filtroEstadoMovimientoBancario = (valor: unknown): ClausulaFiltro | null => {
    const estados = comoLista(valor);
    if (!estados.length) return null;

    return ["estado", "in", estados as unknown as string] as ClausulaFiltro;
};

export const estadosMovimientoBancarioDesdeFiltro = (filtro: ClausulaFiltro[]): string[] => {
    const clausula = filtro.find(([campo, operador]) => campo === "estado" && operador === "in");

    return clausula ? comoLista(clausula[2]) : [];
};

/** URL de la conciliación de una cuenta bancaria de la empresa (`cuentasbanco.codcuenta`). */
export const urlConciliacionCuentaBancaria = (cuentaBancoId: string): string =>
    `/tesoreria/cuentas_bancarias/${cuentaBancoId}/conciliacion`;

/** Movimientos de una cuenta bancaria de la empresa (`/tesoreria/cuentas_bancarias/<cuenta_id>/conciliacion`). */
export const filtroCuentaBanco = (cuentaBancoId: string): ClausulaFiltro =>
    ["cuenta_banco_id", "=", cuentaBancoId] as ClausulaFiltro;

/** Nombre de la cuenta a mostrar: el del banco, o el de la cuenta bancaria de la empresa si se asoció. */
export const cuentaMovimientoBancario = (movimiento: MovimientoBancario): string =>
    movimiento.nombreCuenta || movimiento.descripcionCuentaBanco || "Cuenta sin identificar";

/**
 * Resumen del resultado de conciliación para mostrar en la lista.
 * Como ahora el movimiento puede tener varios ítems, muestra el número.
 */
export const reciboAsociadoMovimientoBancario = (movimiento: MovimientoBancario): string => {
    if (movimiento.numItemsConciliacion === 0) return "—";
    return movimiento.numItemsConciliacion === 1 ? "1 ítem" : `${movimiento.numItemsConciliacion} ítems`;
};

const RUTA_RECIBO: Record<TipoReciboMovimiento, string> = {
    cobro: "/tesoreria/recibo_venta",
    pago: "/tesoreria/recibo_compra",
};

/** Clase de recibo que liquida cada tipo de conciliación (los de asiento, ninguno). */
const TIPO_RECIBO_CONCILIACION: Partial<Record<TipoConciliacion, TipoReciboMovimiento>> = {
    cobrar_recibo_venta: "cobro",
    cobro_parcial_venta: "cobro",
    pagar_recibo_compra: "pago",
    pago_parcial_compra: "pago",
};

export const tipoReciboConciliacion = (tipo: TipoConciliacion | null): TipoReciboMovimiento | null =>
    (tipo && TIPO_RECIBO_CONCILIACION[tipo]) ?? null;

const ETIQUETA_TIPO_CONCILIACION: Record<TipoConciliacion, string> = {
    cobrar_recibo_venta: "Cobro de recibo",
    pagar_recibo_compra: "Pago de recibo",
    cobro_parcial_venta: "Cobro parcial",
    pago_parcial_compra: "Pago parcial",
    asiento_manual: "Asiento manual",
    asiento_vinculado: "Asiento vinculado",
    cuota_prestamo: "Cuota de préstamo",
    cobrar_remesa: "Cobro de remesa",
    cobro_parcial_remesa: "Cobro parcial de remesa",
    pagar_remesa: "Pago de remesa",
};

export const etiquetaTipoConciliacion = (tipo: TipoConciliacion): string => ETIQUETA_TIPO_CONCILIACION[tipo];

export const esConciliacionParcial = (tipo: TipoConciliacion): boolean =>
    tipo === "cobro_parcial_venta" || tipo === "pago_parcial_compra";

export const esConciliacionRemesa = (tipo: TipoConciliacion): boolean =>
    tipo === "cobrar_remesa" || tipo === "cobro_parcial_remesa" || tipo === "pagar_remesa";

/** Paga una remesa de pago (recibos de proveedor o nóminas), que se paga siempre entera. */
export const esConciliacionRemesaPago = (tipo: TipoConciliacion): boolean => tipo === "pagar_remesa";

/** Una remesa de pago es de nóminas o de recibos; las de cobro, siempre de recibos. */
export const esRemesaDeNominas = (remesa: { tipoRemesa: string | null }): boolean =>
    remesa.tipoRemesa === "Nóminas";

/** Las remesas de pago solo se ofrecen con su plugin activo. */
export const remesasPagoActivas = (): boolean => plugin("remesa_pago") === "activo";

/** Tipos de conciliación que piden datos al usuario antes de conciliar. */
export const pideDatosConciliacion = (tipo: TipoConciliacion): boolean => tipo === "asiento_manual";

/** Subcuenta de contrapartida de un asiento manual (la que pidió al usuario), o null. */
export const subcuentaContrapartida = (item: ItemConciliacion): string | null =>
    (item.params.codigo_subcuenta as string | undefined) ?? null;

/** El asiento manual usa como contrapartida la propia subcuenta del banco: el
 * asiento queda banco contra banco y no refleja el movimiento. */
export const contrapartidaEsSubcuentaBanco = (
    item: ItemConciliacion,
    subcuentaBancoId: string | null,
): boolean => subcuentaBancoId !== null && subcuentaContrapartida(item) === subcuentaBancoId;

/** Probabilidad a partir de la cual el servidor concilia sin preguntar. */
export const PROBABILIDAD_CONCILIAR_AUTOMATICAMENTE = 95;

export const varianteProbabilidad = (probabilidad: number): VarianteEtiqueta =>
    probabilidad >= PROBABILIDAD_CONCILIAR_AUTOMATICAMENTE
        ? "exito"
        : probabilidad >= 60 ? "advertencia" : "gris";

/** Enlace a la ficha del recibo (de venta si es un cobro, de compra si es un pago). */
export const urlRecibo = (tipoRecibo: TipoReciboMovimiento, reciboId: string): string =>
    `${RUTA_RECIBO[tipoRecibo]}?id=${encodeURIComponent(reciboId)}`;

/** Enlace a la ficha de la remesa: de cobro o, con `tipo` "pagar_remesa", de pago. */
export const urlRemesa = (remesaId: string, tipo?: TipoConciliacion): string =>
    `${tipo && esConciliacionRemesaPago(tipo) ? "/tesoreria/remesa_pago" : "/tesoreria/remesa"}`
    + `?id=${encodeURIComponent(remesaId)}`;

/** Enlace a la ficha del asiento contable. */
export const urlAsiento = (asientoId: string): string =>
    `/contabilidad/asiento?id=${encodeURIComponent(asientoId)}`;

/** URL del asiento de un ítem (vinculado, o generado al conciliar), para el enlace "Ver asiento". */
export const urlAsientoConciliacion = (item: ItemConciliacion): string | null =>
    item.asientoId ? urlAsiento(item.asientoId) : null;

/** URL de la remesa de un ítem de remesa (para el enlace "Ver remesa"). */
export const urlRemesaConciliacion = (item: ItemConciliacion): string | null =>
    item.remesa ? urlRemesa(item.remesa.id, item.tipo) : null;

/** Recibos de la remesa que paga un ítem: los de `params.recibo_ids` si es parcial, todos si no (`null`). */
export const reciboIdsConciliacionRemesa = (item: ItemConciliacion): string[] | null =>
    Array.isArray(item.params.recibo_ids) ? item.params.recibo_ids.map(String) : null;

/** URL del recibo del primer ítem de una conciliación candidata (para el enlace "Ver recibo"). */
export const urlReciboConciliacion = (item: ItemConciliacion): string | null => {
    const tipoRecibo = tipoReciboConciliacion(item.tipo);
    return tipoRecibo && item.recibo ? urlRecibo(tipoRecibo, item.recibo.id) : null;
};

/** Conciliación a mano con un recibo elegido en la búsqueda: completa por su importe, parcial si es mayor. */
export const conciliacionDesdeCandidato = (
    movimiento: MovimientoBancario,
    candidato: CandidatoConciliacion
): ItemConciliacion => {
    const params: Record<string, unknown> = esConciliacionParcial(candidato.tipoConciliacion)
        ? { recibo_id: Number(candidato.reciboId), importe: Math.abs(movimiento.importe).toFixed(2) }
        : { recibo_id: Number(candidato.reciboId) };
    return {
        tipo: candidato.tipoConciliacion,
        params,
        recibo: {
            id: candidato.reciboId,
            codigo: candidato.codigo,
            tercero: candidato.tercero,
            importe: candidato.importe,
            fechaVencimiento: candidato.fechaVencimiento,
            estado: candidato.estado,
            fechaEmision: null,
            fechaCobro: null,
        },
        cuota: null,
        remesa: null,
        asientoId: null,
        asiento: null,
    };
};

const redondear = (importe: number): number => Math.round(importe * 100) / 100;

/** Suma de los recibos elegidos de una remesa. */
export const importeRecibosRemesa = (remesa: RemesaCandidata, reciboIds: string[]): number =>
    redondear(remesa.recibos
        .filter((recibo) => reciboIds.includes(recibo.reciboId))
        .reduce((total, recibo) => total + recibo.importe, 0));

/** Los recibos elegidos suman exactamente el importe del movimiento (el servidor exige lo mismo). */
export const cuadraRemesa = (
    movimiento: MovimientoBancario,
    remesa: RemesaCandidata,
    reciboIds: string[]
): boolean =>
    reciboIds.length > 0 && importeRecibosRemesa(remesa, reciboIds) === redondear(Math.abs(movimiento.importe));

/**
 * Conciliación a mano con una remesa: si se pagan todos sus recibos pendientes
 * es un cobro de remesa; si solo algunos, un cobro parcial con esos recibos.
 * Una remesa de pago se paga siempre entera.
 */
export const conciliacionDesdeRemesa = (remesa: RemesaCandidata, reciboIds: string[]): ItemConciliacion => {
    const todos = remesa.recibos.every((recibo) => reciboIds.includes(recibo.reciboId));
    const dePago = esConciliacionRemesaPago(remesa.tipoConciliacion);
    return {
        tipo: dePago ? "pagar_remesa" : todos ? "cobrar_remesa" : "cobro_parcial_remesa",
        params: dePago || todos
            ? { remesa_id: Number(remesa.id) }
            : { remesa_id: Number(remesa.id), recibo_ids: reciboIds.map(Number) },
        recibo: null,
        cuota: null,
        remesa: {
            id: remesa.id,
            fechaCargo: remesa.fechaCargo,
            total: remesa.total,
            estado: "Emitida",
            numRecibos: remesa.recibos.length,
            tipoRemesa: remesa.tipoRemesa,
        },
        asientoId: null,
        asiento: null,
    };
};

/** Lo que quedaría pendiente en el recibo nuevo tras un cobro o pago parcial. */
export const restoConciliacionParcial = (movimiento: MovimientoBancario, importeRecibo: number): number =>
    Math.round((importeRecibo - Math.abs(movimiento.importe)) * 100) / 100;

export const esIngresoMovimientoBancario = (movimiento: MovimientoBancario): boolean =>
    movimiento.importe >= 0;

/** El movimiento puede pagar remesas: de cobro si es un ingreso; de pago si es un cargo y
 * las remesas de pago están activas. */
export const conRemesas = (
    movimiento: MovimientoBancario,
    pagoActivas: () => boolean = remesasPagoActivas,
): boolean => esIngresoMovimientoBancario(movimiento) || pagoActivas();

/** Una partida solo se puede vincular si su importe es el del movimiento (±0.01). */
export const importePartidaCoincide = (partida: PartidaHuerfana, movimiento: MovimientoBancario): boolean =>
    Math.abs(partida.importe - movimiento.importe) < 0.01;

const normalizarTexto = (texto: string): string =>
    texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

const contieneTexto = (texto: string, valores: (string | null)[]): boolean => {
    const buscado = normalizarTexto(texto);
    return !buscado || valores.some((valor) => valor !== null && normalizarTexto(valor).includes(buscado));
};

/**
 * Recibos, remesas y partidas contables en una sola lista ordenada por fecha descendente (más recientes primero).
 * Los recibos ya llegan filtrados por `texto` desde la API (GET `.../candidatos`);
 * las remesas (por id, código o tercero de sus recibos) y las partidas (por número
 * de asiento o descripción) se filtran aquí con el mismo texto. Los ya seleccionados
 * para una conciliación de varios candidatos no aparecen: están en la selección.
 */
export const listaCandidatosConciliacion = (
    recibos: CandidatoConciliacion[],
    remesas: RemesaCandidata[],
    partidas: PartidaHuerfana[],
    texto: string,
    seleccion: CandidatoListaConciliacion[] = [],
): CandidatoListaConciliacion[] => [
    ...recibos.map((recibo): CandidatoListaConciliacion => ({
        clase: "recibo", id: `recibo_${recibo.id}`, fecha: recibo.fechaVencimiento,
        tipo: recibo.tipoConciliacion, recibo,
    })),
    ...remesas
        .filter((remesa) => contieneTexto(texto, [
            remesa.id, ...remesa.recibos.flatMap((recibo) => [recibo.codigo, recibo.tercero]),
        ]))
        .map((remesa): CandidatoListaConciliacion => ({
            clase: "remesa", id: `remesa_${remesa.tipoConciliacion}_${remesa.id}`, fecha: remesa.fechaCargo,
            tipo: remesa.tipoConciliacion, remesa,
        })),
    ...partidas
        .filter((partida) => contieneTexto(texto, [
            partida.numeroAsiento, String(partida.idasiento), partida.descripcion,
        ]))
        .map((partida): CandidatoListaConciliacion => ({
            clase: "partida", id: `partida_${partida.idasiento}`, fecha: partida.fecha,
            tipo: "asiento_vinculado", partida,
        })),
]
    .filter((candidato) => !seleccion.some((seleccionado) => seleccionado.id === candidato.id))
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

export const FILTROS_CANDIDATO: { tipo: TipoFiltroCandidato; etiqueta: string }[] = [
    { tipo: "cobro", etiqueta: "Cobro" },
    { tipo: "pago", etiqueta: "Pago" },
    { tipo: "remesa_cobro", etiqueta: "Remesa de cobros" },
    { tipo: "remesa_pago", etiqueta: "Remesa de pagos" },
    { tipo: "asiento", etiqueta: "Asiento" },
];

const tipoFiltroCandidato = (candidato: CandidatoListaConciliacion): TipoFiltroCandidato => {
    switch (candidato.clase) {
        case "recibo":
            return candidato.recibo.tipoRecibo;
        case "remesa":
            return esConciliacionRemesaPago(candidato.remesa.tipoConciliacion) ? "remesa_pago" : "remesa_cobro";
        case "partida":
            return "asiento";
    }
};

/** Los candidatos de cualquiera de los tipos marcados; sin ninguno marcado, todos. */
export const filtrarCandidatosPorTipo = (
    lista: CandidatoListaConciliacion[],
    tipos: TipoFiltroCandidato[],
): CandidatoListaConciliacion[] =>
    tipos.length === 0 ? lista : lista.filter((candidato) => tipos.includes(tipoFiltroCandidato(candidato)));

/**
 * Puede sumarse a otros en una conciliación de varios candidatos: lo que se liquida entero
 * (recibos por su importe o por menos, remesas enteras) y las partidas que mueven el banco en
 * el mismo sentido que el movimiento. Los parciales cubren siempre todo el movimiento.
 */
export const admiteSeleccion = (candidato: CandidatoListaConciliacion, movimiento: MovimientoBancario): boolean => {
    switch (candidato.clase) {
        case "recibo":
            return candidato.recibo.encaje !== "parcial";
        case "remesa":
            return candidato.remesa.tipoConciliacion !== "cobro_parcial_remesa";
        case "partida":
            return candidato.partida.importe !== 0
                && Math.sign(candidato.partida.importe) === Math.sign(movimiento.importe);
    }
};

/** Lo que un candidato seleccionado cubre del movimiento, en positivo. */
const importeCandidato = (candidato: CandidatoListaConciliacion): number => {
    switch (candidato.clase) {
        case "recibo":
            return candidato.recibo.importe;
        case "remesa":
            return esConciliacionRemesaPago(candidato.remesa.tipoConciliacion)
                ? candidato.remesa.total
                : candidato.remesa.importePendiente;
        case "partida":
            return Math.abs(candidato.partida.importe);
    }
};

export const sumaSeleccion = (seleccion: CandidatoListaConciliacion[]): number =>
    redondear(seleccion.reduce((total, candidato) => total + importeCandidato(candidato), 0));

/** Lo que falta (positivo) o sobra (negativo) para llegar al importe del movimiento. */
export const diferenciaSeleccion = (movimiento: MovimientoBancario, seleccion: CandidatoListaConciliacion[]): number =>
    redondear(Math.abs(movimiento.importe) - sumaSeleccion(seleccion));

/** Solo se concilia si la selección suma exactamente el movimiento (el servidor exige lo mismo). */
export const seleccionCuadra = (movimiento: MovimientoBancario, seleccion: CandidatoListaConciliacion[]): boolean =>
    seleccion.length > 0 && diferenciaSeleccion(movimiento, seleccion) === 0;

const itemDesdeSeleccionado = (candidato: CandidatoListaConciliacion): ItemConciliacion => {
    const importe = importeCandidato(candidato).toFixed(2);
    switch (candidato.clase) {
        case "recibo": {
            // El movimiento solo cuenta en un parcial, y los parciales no se seleccionan.
            const item = conciliacionDesdeCandidato(movimientoBancarioVacio, candidato.recibo);
            return { ...item, params: { ...item.params, importe } };
        }
        case "remesa": {
            const { remesa } = candidato;
            const item = conciliacionDesdeRemesa(remesa, remesa.recibos.map((recibo) => recibo.reciboId));
            return { ...item, params: { ...item.params, importe } };
        }
        case "partida": {
            const { partida } = candidato;
            return {
                tipo: "asiento_vinculado",
                params: { idasiento: partida.idasiento, importe: partida.importe.toFixed(2) },
                recibo: null,
                cuota: null,
                remesa: null,
                asientoId: null,
                asiento: {
                    id: String(partida.idasiento),
                    numero: partida.numeroAsiento,
                    fecha: partida.fecha,
                    importe: partida.importe,
                    concepto: partida.descripcion,
                },
            };
        }
    }
};

/**
 * Ítems de una conciliación de varios candidatos: cada uno con el `importe` que cubre (la
 * partida, con el signo con que mueve el banco), que el servidor suma y comprueba.
 */
export const itemsDesdeSeleccion = (seleccion: CandidatoListaConciliacion[]): ItemConciliacion[] =>
    seleccion.map(itemDesdeSeleccionado);

export type BloqueoConciliarMovimiento = {
    bloqueado: boolean;
    motivo: string | null;
};

/**
 * Motivos por los que la UI debe impedir conciliar antes de llamar a la API (el
 * backend valida lo mismo y devuelve 409, pero conviene avisar antes de
 * intentarlo). Ver PATCH `movimiento_bancario/{id}/conciliar`.
 */
export const bloqueoConciliarMovimientoBancario = (movimiento: MovimientoBancario): BloqueoConciliarMovimiento => {
    if (!movimiento.cuentaBancoId) {
        return {
            bloqueado: true,
            motivo: "Asocia la cuenta en Tesorería / Conexiones bancarias para poder conciliar este movimiento.",
        };
    }
    if (movimiento.pendiente) {
        return {
            bloqueado: true,
            motivo: "El banco todavía no ha confirmado este movimiento; espera a la próxima sincronización.",
        };
    }
    if (movimiento.eliminadoEnBanco) {
        return {
            bloqueado: true,
            motivo: "El banco ya no devuelve este movimiento; no se puede conciliar.",
        };
    }
    return { bloqueado: false, motivo: null };
};

const ETIQUETA_ORIGEN: Record<OrigenConciliacionMovimiento, string> = {
    determinista: "Automática (reglas)",
    ia: "Automática (IA)",
    manual: "Manual",
};

export const etiquetaOrigenConciliacion = (origen: OrigenConciliacionMovimiento | null): string =>
    origen ? ETIQUETA_ORIGEN[origen] : "—";

const textoRecibo = (item: ItemConciliacion): string =>
    item.recibo ? `recibo ${item.recibo.codigo}` : "recibo";

const textoRemesa = (item: ItemConciliacion): string =>
    item.remesa ? `remesa ${item.remesa.id}` : "remesa";

/**
 * Qué deshace el servidor al desconciliar cada ítem (ver `deshacer` de cada
 * resolutor en `movimiento_bancario/aplicacion/conciliaciones.py`).
 */
export const consecuenciaDesconciliarItem = (item: ItemConciliacion): string => {
    switch (item.tipo) {
        case "cobrar_recibo_venta":
            return `Se anulará el cobro del ${textoRecibo(item)} y volverá a quedar pendiente de cobro.`;
        case "pagar_recibo_compra":
            return `Se anulará el pago del ${textoRecibo(item)} y volverá a quedar pendiente de pago.`;
        case "cobro_parcial_venta":
            return `Se anulará el cobro parcial del ${textoRecibo(item)} y se volverá a unir con el recibo `
                + "que se generó por el resto: quedará un único recibo pendiente por el importe original.";
        case "pago_parcial_compra":
            return `Se anulará el pago parcial del ${textoRecibo(item)} y se volverá a unir con el recibo `
                + "que se generó por el resto: quedará un único recibo pendiente por el importe original.";
        case "cobrar_remesa":
            return `Se deshará el cobro de la ${textoRemesa(item)}: sus recibos volverán a quedar pendientes de cobro. `
                + "Solo es posible si es el último cobro registrado en la remesa.";
        case "cobro_parcial_remesa": {
            const recibos = reciboIdsConciliacionRemesa(item);
            const cuantos = recibos ? `los ${recibos.length} recibos cobrados` : "los recibos cobrados";
            return `Se deshará el cobro parcial de la ${textoRemesa(item)}: ${cuantos} volverán a quedar pendientes. `
                + "Solo es posible si es el último cobro registrado en la remesa.";
        }
        case "pagar_remesa": {
            const que = item.remesa && esRemesaDeNominas(item.remesa) ? "sus nóminas" : "sus recibos";
            return `Se deshará el pago de la ${textoRemesa(item)} de pago y se borrará su asiento: `
                + `${que} seguirán en la remesa, pendientes de pago.`;
        }
        case "asiento_manual":
            return "Se borrará el asiento contable que se generó al conciliar.";
        case "asiento_vinculado":
            return "Se desvinculará el asiento contable, que no se borra: su partida volverá a quedar "
                + "sin movimiento bancario.";
        case "cuota_prestamo": {
            const contrato = item.cuota?.contrato ? ` ${item.cuota.contrato}` : "";
            return `Se borrará el asiento de la cuota del préstamo${contrato} y la cuota volverá a quedar `
                + "pendiente de contabilizar.";
        }
    }
};

/** Mensaje del diálogo de desconciliar, con las consecuencias de cada ítem de la conciliación aplicada. */
export const mensajeDesconciliarMovimientoBancario = (conciliacion: Conciliacion | null): string => {
    const items = conciliacion?.items ?? [];
    const consecuencias = items.length === 0
        ? ["Se deshará todo lo que se generó al conciliar el movimiento (pagos, asientos...)."]
        : items.length === 1
            ? [consecuenciaDesconciliarItem(items[0])]
            : items.map((item) => `• ${consecuenciaDesconciliarItem(item)}`);

    return [
        ...consecuencias,
        "",
        "El movimiento volverá a quedar pendiente de conciliar. Si el banco ya no lo devuelve, "
        + "desaparecerá de la lista tras desconciliarlo.",
    ].join("\n");
};
