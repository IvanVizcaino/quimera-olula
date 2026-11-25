import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import { ORDEN_TAREAS_DEFECTO } from "../tarea/dominio.ts";
import { TareaApi, tareaDesdeApi } from "../tarea/infraestructura.ts";
import {
    ComponenteTerminal,
    ConfigTerminal,
    ConsumosTarea,
    CuerpoDeclarar,
    CuerpoEditarTramo,
    LoteLeido,
    TareaTerminal,
    TramoTerminal,
    TrabajadorLeido,
} from "./diseño.ts";
import { filtroListaTerminal } from "./dominio.ts";

const texto = (v: string | number | null | undefined): string => (v === null || v === undefined ? "" : String(v));
const numero = (v: number | string | null | undefined): number => {
    const n = Number(v ?? 0);
    return Number.isNaN(n) ? 0 : n;
};
const enc = encodeURIComponent;

export interface TrabajadorLeidoApi {
    codigo: string;
    existe: boolean;
    nombre: string | null;
    de_baja: boolean | null;
}

export const trabajadorLeidoDesdeApi = (api: TrabajadorLeidoApi): TrabajadorLeido => ({
    codigo: texto(api.codigo),
    existe: !!api.existe,
    nombre: texto(api.nombre),
    deBaja: !!api.de_baja,
});

export interface ConfigTerminalApi {
    usar_tramos: boolean | null;
    mostrar_formulario: boolean | null;
    control_tiempo: boolean | null;
    decimales: number | null;
    maximo_tramo: number | string | null;
    permite_deshacer: boolean | null;
}

export const configTerminalDesdeApi = (api: ConfigTerminalApi): ConfigTerminal => ({
    usarTramos: !!api.usar_tramos,
    mostrarFormulario: !!api.mostrar_formulario,
    controlTiempo: !!api.control_tiempo,
    decimales: api.decimales === null || api.decimales === undefined ? 2 : Number(api.decimales),
    maximoTramo: api.maximo_tramo === null || api.maximo_tramo === undefined || api.maximo_tramo === "" ? null : Number(api.maximo_tramo),
    permiteDeshacer: api.permite_deshacer !== false,
});

export type TareaTerminalApi = TareaApi & { cantidad_hecha?: number | string | null; unidad?: string | null };

export const tareaTerminalDesdeApi = (api: TareaTerminalApi): TareaTerminal => ({
    ...tareaDesdeApi(api),
    cantidadHecha: numero(api.cantidad_hecha),
    unidad: texto(api.unidad),
});

export interface ComponenteTerminalApi {
    componente_id: string | number;
    articulo_id: string;
    descripcion: string | null;
    cantidad_unidad: number | string;
    previsto: number | string;
    consumido: number | string;
    pendiente: number | string;
    por_lotes: boolean;
    minimo: number | string;
    puede_cerrar: boolean;
    lotes: { lote_id: string; cantidad: number | string; tramo_id: string | number | null }[];
}

const componenteDesdeApi = (api: ComponenteTerminalApi): ComponenteTerminal => ({
    componenteId: texto(api.componente_id),
    articuloId: texto(api.articulo_id),
    descripcion: texto(api.descripcion),
    cantidadUnidad: numero(api.cantidad_unidad),
    previsto: numero(api.previsto),
    consumido: numero(api.consumido),
    pendiente: numero(api.pendiente),
    porLotes: !!api.por_lotes,
    minimo: numero(api.minimo),
    puedeCerrar: !!api.puede_cerrar,
    lotes: (api.lotes ?? []).map((l) => ({ loteId: texto(l.lote_id), cantidad: numero(l.cantidad), tramoId: texto(l.tramo_id) })),
});

export interface ConsumosTareaApi {
    id: string;
    estado: string;
    codigo: string | null;
    descripcion: string | null;
    final: boolean | null;
    proceso_id: string | number;
    orden_id: string | null;
    lote_id: string | null;
    articulo_id: string | null;
    articulo: string | null;
    cantidad_prevista: number | string | null;
    cantidad_hecha: number | string | null;
    cantidad_pendiente: number | string | null;
    unidad: string | null;
    componentes: ComponenteTerminalApi[];
}

export const consumosDesdeApi = (api: ConsumosTareaApi): ConsumosTarea => ({
    id: api.id,
    estado: texto(api.estado),
    codigo: texto(api.codigo),
    descripcion: texto(api.descripcion),
    final: !!api.final,
    procesoId: texto(api.proceso_id),
    ordenId: texto(api.orden_id),
    loteId: texto(api.lote_id),
    articuloId: texto(api.articulo_id),
    articulo: texto(api.articulo),
    cantidadPrevista: numero(api.cantidad_prevista),
    cantidadHecha: numero(api.cantidad_hecha),
    cantidadPendiente: numero(api.cantidad_pendiente),
    unidad: texto(api.unidad),
    componentes: (api.componentes ?? []).map(componenteDesdeApi),
});

export interface TramoTerminalApi {
    id: string | number;
    tarea_id: string;
    trabajador_id: string | null;
    trabajador: string | null;
    cantidad: number | string;
    dia_inicio: string | null;
    tiempo_inicio: string | null;
    dia_fin: string | null;
    tiempo_fin: string | null;
    movimientos: { componente_id: string | number | null; articulo_id: string; lote_id: string | null; cantidad: number | string }[];
}

export const tramoDesdeApi = (api: TramoTerminalApi): TramoTerminal => ({
    id: texto(api.id),
    tareaId: texto(api.tarea_id),
    trabajadorId: texto(api.trabajador_id),
    trabajador: texto(api.trabajador),
    cantidad: numero(api.cantidad),
    diaInicio: texto(api.dia_inicio).slice(0, 10),
    tiempoInicio: texto(api.tiempo_inicio),
    diaFin: texto(api.dia_fin).slice(0, 10),
    tiempoFin: texto(api.tiempo_fin),
    movimientos: (api.movimientos ?? []).map((m) => ({
        componenteId: texto(m.componente_id),
        articuloId: texto(m.articulo_id),
        loteId: texto(m.lote_id),
        cantidad: numero(m.cantidad),
    })),
});

export interface LoteLeidoApi {
    id: string;
    articulo_id: string;
    articulo: string | null;
    caducidad: string | null;
    en_almacen: number | string | null;
    disponible: number | string | null;
    por_lotes: boolean | null;
    componente_id: string | number | null;
}

export const loteLeidoDesdeApi = (api: LoteLeidoApi): LoteLeido => ({
    id: texto(api.id),
    articuloId: texto(api.articulo_id),
    articulo: texto(api.articulo),
    caducidad: texto(api.caducidad).slice(0, 10),
    enAlmacen: numero(api.en_almacen),
    disponible: numero(api.disponible),
    porLotes: !!api.por_lotes,
    componenteId: texto(api.componente_id),
});

const urlTarea = (id: string) => `/produccion/tarea/${enc(id)}`;
const urlTerminal = `/produccion/terminal`;

export const getTrabajadorPorCodigo = async (codigo: string): Promise<TrabajadorLeido> =>
    RestAPI.getItem<TrabajadorLeido, TrabajadorLeidoApi>(`/produccion/trabajador/codigo/${enc(codigo)}`, trabajadorLeidoDesdeApi);

export const getConfigTerminal = async (): Promise<ConfigTerminal> =>
    RestAPI.getItem<ConfigTerminal, ConfigTerminalApi>(`${urlTerminal}/config`, configTerminalDesdeApi);

export const getTareaTerminal = async (id: string): Promise<TareaTerminal> =>
    RestAPI.getItem<TareaTerminal, TareaTerminalApi>(`${urlTerminal}/tarea/${enc(id)}`, tareaTerminalDesdeApi);

/** Pendientes, en curso y en pausa (del centro del puesto, si lo hay). */
export const getTareasTerminal = async (centroId: string | null) => {
    const criteria: Criteria = {
        ...criteriaDefecto,
        filtro: filtroListaTerminal(centroId),
        orden: ORDEN_TAREAS_DEFECTO,
        paginacion: { limite: 100, pagina: 1 },
    };
    return RestAPI.getQuery<TareaTerminal, TareaTerminalApi>(`${urlTerminal}/tarea`, criteria, tareaTerminalDesdeApi);
};

export const getConsumosTarea = async (id: string, trabajadorId?: string | null): Promise<ConsumosTarea> =>
    RestAPI.getItem<ConsumosTarea, ConsumosTareaApi>(
        `${urlTerminal}/tarea/${enc(id)}/consumos${trabajadorId ? `?trabajador_id=${enc(trabajadorId)}` : ""}`,
        consumosDesdeApi,
    );

export const getTramosTarea = async (id: string): Promise<TramoTerminal[]> =>
    RestAPI.getLista<TramoTerminal, TramoTerminalApi>(`${urlTerminal}/tarea/${enc(id)}/tramos`, tramoDesdeApi);

export const getLoteTerminal = async (codigo: string, tareaId: string): Promise<LoteLeido> =>
    RestAPI.getItem<LoteLeido, LoteLeidoApi>(`${urlTerminal}/lote/${enc(codigo)}?tarea=${enc(tareaId)}`, loteLeidoDesdeApi);

export const postIniciarTarea = async (id: string, trabajadorId: string): Promise<void> => {
    await RestAPI.post(`${urlTarea(id)}/iniciar`, { trabajador_id: trabajadorId }, "Error al iniciar la tarea");
};

export const postDeshacerTarea = async (id: string): Promise<void> => {
    await RestAPI.post(`${urlTarea(id)}/deshacer`, {}, "Error al deshacer la tarea");
};

export const postDeclarar = async (id: string, cuerpo: CuerpoDeclarar): Promise<void> => {
    await RestAPI.post(`${urlTarea(id)}/declarar`, cuerpo, "Error al declarar la producción");
};

export const patchTramo = async (id: string, tramoId: string, cuerpo: CuerpoEditarTramo): Promise<void> => {
    await RestAPI.patch(`${urlTarea(id)}/tramo/${enc(tramoId)}`, cuerpo, "Error al cambiar el tramo");
};

export const deleteTramo = async (id: string, tramoId: string): Promise<void> => {
    await RestAPI.delete(`${urlTarea(id)}/tramo/${enc(tramoId)}`, "Error al borrar el tramo");
};
