import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos, MetaModelo } from "@olula/lib/dominio.ts";
import {
    CandidatoConciliacion, CandidatoListaConciliacion, Conciliacion, MovimientoBancario, PartidaHuerfana,
    RemesaCandidata,
} from "../diseño.js";
import {
    admiteSeleccion,
    conciliacionDesdeCandidato,
    conciliacionDesdeRemesa,
    conRemesas,
    itemsDesdeSeleccion,
    movimientoBancarioVacio,
    seleccionCuadra,
} from "../dominio.js";
import {
    getCandidatosConciliacion,
    getConciliacionAplicadaMovimientoBancario,
    getConciliacionesMovimientoBancario,
    getMovimientoBancario,
    getPartidasHuerfanas,
    getRemesasConciliacion,
    patchConciliarMovimientoBancario,
    patchDesconciliarMovimientoBancario,
    patchIgnorarMovimientoBancario,
    patchReactivarMovimientoBancario,
} from "../infraestructura.js";
import { ConciliacionSeleccionada, ContextoDetalleConciliacion, EstadoDetalleConciliacion } from "./diseño.js";

type ProcesarDetalle = ProcesarContexto<EstadoDetalleConciliacion, ContextoDetalleConciliacion>;

const pipeMovimiento = ejecutarListaProcesos<EstadoDetalleConciliacion, ContextoDetalleConciliacion>;

/**
 * Cabecera de solo lectura: la sincronización con el proveedor bancario es
 * quien crea y actualiza los movimientos (ver maestro/SincronizarMovimientoBancario.tsx).
 * La conciliación (conciliaciones, Conciliar/Desconciliar/Ignorar/Reactivar) se
 * gestiona con las acciones de más abajo, no editando este modelo.
 */
export const metaMovimientoBancario: MetaModelo<MovimientoBancario> = {
    campos: {
        fecha: { tipo: "fecha" },
        fechaValor: { tipo: "fecha" },
        institucionNombre: { tipo: "texto" },
        concepto: { tipo: "texto" },
        contraparte: { tipo: "texto" },
        referencia: { tipo: "texto" },
        importe: { tipo: "moneda" },
        divisa: { tipo: "texto" },
        idExterno: { tipo: "texto" },
        estado: { tipo: "texto" },
        numItemsConciliacion: { tipo: "numero" },
        probabilidad: { tipo: "numero" },
        origenConciliacion: { tipo: "texto" },
        justificacion: { tipo: "texto" },
        conciliadoPor: { tipo: "texto" },
        conciliadoEn: { tipo: "fecha" },
    },
    editable: () => false,
};

export const contextoDetalleConciliacionInicial: ContextoDetalleConciliacion = {
    estado: 'INICIAL',
    movimiento: movimientoBancarioVacio,
    conciliaciones: [],
    conciliacionAplicada: null,
    candidatos: [],
    candidatosTexto: "",
    remesas: [],
    partidas: [],
    conciliacionSeleccionada: null,
    seleccion: [],
    remesaSeleccionada: null,
};

/** Solo tiene sentido buscar candidatos si el movimiento aún puede conciliarse. */
const requiereCandidatos = (movimiento: MovimientoBancario): boolean =>
    movimiento.estado === "pendiente" || movimiento.estado === "candidatos";

/** Un ingreso puede pagar una remesa de cobro y un cargo, una de pago (si su plugin está activo). */
const cargarRemesas = async (movimiento: MovimientoBancario): Promise<RemesaCandidata[]> =>
    requiereCandidatos(movimiento) && conRemesas(movimiento)
        ? await getRemesasConciliacion(movimiento.id)
        : [];

/** Partidas contables de la subcuenta bancaria que el movimiento podría vincular. */
const cargarPartidas = async (movimiento: MovimientoBancario): Promise<PartidaHuerfana[]> =>
    requiereCandidatos(movimiento) && movimiento.cuentaConexionId
        ? await getPartidasHuerfanas(movimiento.cuentaConexionId)
        : [];

const cargarConciliaciones = async (movimiento: MovimientoBancario): Promise<Conciliacion[]> =>
    movimiento.estado === "candidatos"
        ? await getConciliacionesMovimientoBancario(movimiento.id)
        : [];

const cargarConciliacionAplicada = async (movimiento: MovimientoBancario): Promise<Conciliacion | null> =>
    movimiento.estado === "conciliado"
        ? await getConciliacionAplicadaMovimientoBancario(movimiento.id)
        : null;

/**
 * Carga (o recarga con un nuevo texto de búsqueda) los candidatos del
 * movimiento actual. Se deja al backend cualquier filtro por importe/estado;
 * aquí solo se evita la llamada cuando el movimiento ya no es conciliable.
 */
export const cargarCandidatos: ProcesarDetalle = async (contexto, payload) => {
    const texto = typeof payload === "string" ? payload : "";
    const candidatos = requiereCandidatos(contexto.movimiento)
        ? await getCandidatosConciliacion(contexto.movimiento.id, texto || undefined)
        : [];
    return { ...contexto, candidatos, candidatosTexto: texto };
};

/** Una de las conciliaciones candidatas. */
export const seleccionarConciliacion: ProcesarDetalle = async (contexto, payload) => {
    const conciliacion = payload as Conciliacion;
    const seleccionada: ConciliacionSeleccionada = {
        conciliacionId: conciliacion.id,
        items: conciliacion.items,
        probabilidad: conciliacion.probabilidad,
        justificacion: conciliacion.justificacion,
    };
    return { ...contexto, conciliacionSeleccionada: seleccionada };
};

/** Un recibo elegido en la búsqueda: completo si es por el importe del movimiento, parcial si es mayor. */
export const seleccionarCandidato: ProcesarDetalle = async (contexto, payload) => {
    const candidato = payload as CandidatoConciliacion;
    const seleccionada: ConciliacionSeleccionada = {
        conciliacionId: null,
        items: [conciliacionDesdeCandidato(contexto.movimiento, candidato)],
        probabilidad: null,
        justificacion: null,
    };
    return { ...contexto, conciliacionSeleccionada: seleccionada };
};

/** Una remesa de la lista: los recibos que paga se confirman en el modal. */
export const seleccionarRemesa: ProcesarDetalle = async (contexto, payload) => ({
    ...contexto,
    remesaSeleccionada: payload as RemesaCandidata,
});

/** Reúne un candidato con los demás seleccionados para conciliarlos juntos. */
export const añadirCandidato: ProcesarDetalle = async (contexto, payload) => {
    const candidato = payload as CandidatoListaConciliacion;
    const yaEsta = contexto.seleccion.some((c) => c.id === candidato.id);
    return yaEsta || !admiteSeleccion(candidato, contexto.movimiento)
        ? contexto
        : { ...contexto, seleccion: [...contexto.seleccion, candidato] };
};

/** `payload`: id del candidato que vuelve a la lista. */
export const quitarCandidato: ProcesarDetalle = async (contexto, payload) => ({
    ...contexto,
    seleccion: contexto.seleccion.filter((c) => c.id !== payload),
});

export const vaciarSeleccion: ProcesarDetalle = async (contexto) => ({ ...contexto, seleccion: [] });

/**
 * Los candidatos seleccionados, si suman el movimiento, pasan a confirmarse en el modal
 * como una conciliación de varios ítems; si no, se sigue en ABIERTO.
 */
export const seleccionarCandidatosReunidos: ProcesarDetalle = async (contexto) =>
    seleccionCuadra(contexto.movimiento, contexto.seleccion)
        ? {
            ...contexto,
            estado: 'CONCILIANDO',
            conciliacionSeleccionada: {
                conciliacionId: null,
                items: itemsDesdeSeleccion(contexto.seleccion),
                probabilidad: null,
                justificacion: null,
            },
        }
        : contexto;

/** Asiento a mano: la subcuenta de contrapartida se pide en el modal. */
export const seleccionarAsiento: ProcesarDetalle = async (contexto) => ({
    ...contexto,
    conciliacionSeleccionada: {
        conciliacionId: null,
        items: [{ tipo: "asiento_manual" as const, params: {}, recibo: null, cuota: null, remesa: null, asientoId: null, asiento: null }],
        probabilidad: null,
        justificacion: null,
    },
});

export const cargarMovimiento: (_: string) => ProcesarDetalle =
    (idMovimiento) => async (contexto) => {
        const movimiento = await getMovimientoBancario(idMovimiento);
        return pipeMovimiento(contexto, [
            async (ctx) => ({
                ...ctx,
                movimiento,
                conciliaciones: await cargarConciliaciones(movimiento),
                conciliacionAplicada: await cargarConciliacionAplicada(movimiento),
                candidatos: [],
                candidatosTexto: "",
                remesas: await cargarRemesas(movimiento),
                partidas: await cargarPartidas(movimiento),
                conciliacionSeleccionada: null,
                seleccion: [],
                remesaSeleccionada: null,
            }),
            cargarCandidatos,
            'ABIERTO',
        ]);
    };

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const idMovimiento = payload as string;
    if (idMovimiento) {
        return cargarMovimiento(idMovimiento)(contexto);
    }
    return {
        ...contexto,
        estado: 'INICIAL',
        movimiento: movimientoBancarioVacio,
        conciliaciones: [],
        conciliacionAplicada: null,
        candidatos: [],
        candidatosTexto: "",
        remesas: [],
        partidas: [],
        conciliacionSeleccionada: null,
        seleccion: [],
        remesaSeleccionada: null,
    };
};

/**
 * Recarga cabecera, conciliaciones y candidatos tras Conciliar/Ignorar/Reactivar y
 * propaga el cambio al maestro (`movimiento_cambiado`) para refrescar la fila
 * de la lista. Fija `estado: 'ABIERTO'`: quien la usa (onConciliado, onIgnorado,
 * onReactivado) parte de un estado de modal (CONCILIANDO...) que debe cerrarse.
 */
export const refrescarMovimiento: ProcesarDetalle = async (contexto) => {
    const movimiento = await getMovimientoBancario(contexto.movimiento.id);
    const candidatos = requiereCandidatos(movimiento)
        ? await getCandidatosConciliacion(movimiento.id, contexto.candidatosTexto || undefined)
        : [];
    const conciliaciones = await cargarConciliaciones(movimiento);
    const conciliacionAplicada = await cargarConciliacionAplicada(movimiento);
    const remesas = await cargarRemesas(movimiento);
    const partidas = await cargarPartidas(movimiento);
    return [
        {
            ...contexto, estado: 'ABIERTO', movimiento, conciliaciones, conciliacionAplicada, candidatos, remesas, partidas,
            conciliacionSeleccionada: null, seleccion: [], remesaSeleccionada: null,
        },
        [["movimiento_cambiado", movimiento]],
    ];
};

/**
 * `payload`: datos extra pedidos al usuario (p. ej. `{ codigo_subcuenta }` de
 * un asiento manual). En el caso 1:M habitual con candidata, `payload` estará
 * vacío; para asiento manual se fusiona con los params del ítem.
 */
export const onConciliado: ProcesarDetalle = async (contexto, payload) => {
    const seleccionada = contexto.conciliacionSeleccionada;
    if (!seleccionada) return contexto;

    const extraDatos = (payload as Record<string, unknown> | undefined) ?? {};
    if (seleccionada.conciliacionId) {
        await patchConciliarMovimientoBancario(
            contexto.movimiento.id,
            {
                conciliacionId: seleccionada.conciliacionId,
                ...(Object.keys(extraDatos).length > 0 && { extraParams: extraDatos }),
            }
        );
    } else {
        // Casación manual: fusionar extraDatos en los params del primer ítem (asiento manual).
        const items = seleccionada.items.map((item, i) =>
            i === 0 ? { ...item, params: { ...item.params, ...extraDatos } } : item
        );
        await patchConciliarMovimientoBancario(contexto.movimiento.id, { items });
    }
    return refrescarMovimiento(contexto);
};

/** `payload`: ids de los recibos de la remesa elegidos en el modal. */
export const onConciliadoRemesa: ProcesarDetalle = async (contexto, payload) => {
    const remesa = contexto.remesaSeleccionada;
    if (!remesa) return contexto;

    await patchConciliarMovimientoBancario(
        contexto.movimiento.id,
        { items: [conciliacionDesdeRemesa(remesa, payload as string[])] }
    );
    return refrescarMovimiento(contexto);
};

export const onIgnorado: ProcesarDetalle = async (contexto, payload) => {
    const motivo = (payload as string | undefined) || undefined;
    await patchIgnorarMovimientoBancario(contexto.movimiento.id, motivo);
    return refrescarMovimiento(contexto);
};

export const onReactivado: ProcesarDetalle = async (contexto) => {
    await patchReactivarMovimientoBancario(contexto.movimiento.id);
    return refrescarMovimiento(contexto);
};

/**
 * Vincula un asiento contable preexistente al movimiento (tipo `asiento_vinculado`).
 * No requiere modal: el usuario ya eligió la partida en la lista de candidatos.
 * `payload` es el `idasiento` (number) del asiento a vincular.
 */
export const onVincularAsiento: ProcesarDetalle = async (contexto, payload) => {
    const { idasiento, importe } = payload as { idasiento: number; importe: number };
    await patchConciliarMovimientoBancario(
        contexto.movimiento.id,
        { items: [{ tipo: "asiento_vinculado" as const, params: { idasiento, importe }, recibo: null, cuota: null, remesa: null, asientoId: null, asiento: null }] }
    );
    return refrescarMovimiento(contexto);
};

/**
 * Desconciliar puede borrar el movimiento si el banco ya lo había retirado
 * (ver contrato de `PATCH .../desconciliar`): el GET posterior de refresco
 * devuelve 404. RestAPI no distingue el código de estado en el error que
 * propaga, así que si el refresco tras un desconciliado con éxito falla se
 * interpreta como que el movimiento ha desaparecido: se avisa al maestro
 * (`movimiento_borrado`) para que lo quite de la lista y se vacía el detalle
 * (al cambiar `movimientos.activo` el maestro recargará o cerrará el panel).
 */
export const onDesconciliado: ProcesarDetalle = async (contexto) => {
    await patchDesconciliarMovimientoBancario(contexto.movimiento.id);
    // Si el banco ya había retirado el movimiento, el backend lo borra al desconciliar.
    if (!contexto.movimiento.eliminadoEnBanco) {
        return await refrescarMovimiento(contexto);
    }
    return [
        {
            ...contexto,
            estado: 'INICIAL',
            movimiento: movimientoBancarioVacio,
            conciliaciones: [],
            conciliacionAplicada: null,
            candidatos: [],
            candidatosTexto: "",
            remesas: [],
            partidas: [],
            conciliacionSeleccionada: null,
            seleccion: [],
            remesaSeleccionada: null,
        },
        [["movimiento_borrado", contexto.movimiento.id]],
    ];
};
