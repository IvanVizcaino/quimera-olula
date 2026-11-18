import { Pasillo } from "#/almacen/pasillo/diseño.ts";
import { getPasillosZona } from "#/almacen/pasillo/infraestructura.ts";
import { accionesListaEntidades, listaEntidadesInicial, ProcesarListaEntidades } from "@olula/lib/ListaEntidades.js";
import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { criteriaDefecto, ejecutarListaProcesos, MetaModelo, stringNoVacio } from "@olula/lib/dominio.ts";
import { Criteria } from "@olula/lib/diseño.ts";
import { Zona } from "../../diseño.ts";
import { FUNCION_ZONA_POR_DEFECTO } from "../../dominio.ts";
import { getUbicacionesZona, getZona } from "../../infraestructura.ts";
import { ContextoDetalleZona, EstadoDetalleZona } from "./diseño.ts";

type ProcesarDetalle = ProcesarContexto<EstadoDetalleZona, ContextoDetalleZona>;

const pipeZona = ejecutarListaProcesos<EstadoDetalleZona, ContextoDetalleZona>;

const conPasillos = (fn: ProcesarListaEntidades<Pasillo>) =>
    (ctx: ContextoDetalleZona) => ({ ...ctx, pasillos: fn(ctx.pasillos) });

export const Pasillos = accionesListaEntidades(conPasillos);

export const metaZona: MetaModelo<Zona> = {
    campos: {
        codigo: { requerido: true, validacion: (m: Zona) => stringNoVacio(m.codigo) },
        almacenId: { requerido: true, validacion: (m: Zona) => stringNoVacio(m.almacenId) },
        descripcion: { requerido: false },
        funcion: { requerido: true, validacion: (m: Zona) => stringNoVacio(m.funcion) },
        clasesAdmitidas: { requerido: false },
        admiteSinClase: { tipo: "checkbox" },
    },
};

export const zonaVaciaDetalle = (): Zona => ({
    id: "",
    codigo: "",
    almacenId: "",
    descripcion: null,
    funcion: FUNCION_ZONA_POR_DEFECTO,
    clasesAdmitidas: [],
    admiteSinClase: true,
});

export const criteriaUbicacionesInicial = (): Criteria => ({ ...criteriaDefecto, orden: ["codigo", "ASC"] });

export const contextoDetalleZonaInicial: ContextoDetalleZona = {
    estado: "INICIAL",
    zona: zonaVaciaDetalle(),
    ubicaciones: [],
    totalUbicaciones: 0,
    criteriaUbicaciones: criteriaUbicacionesInicial(),
    pasillos: listaEntidadesInicial<Pasillo>(),
};

export const refrescarZona: ProcesarDetalle = async (contexto) => {
    const [zona, pagina] = await Promise.all([
        getZona(contexto.zona.id),
        getUbicacionesZona(contexto.zona.id, contexto.criteriaUbicaciones),
    ]);
    return [
        { ...contexto, zona, ubicaciones: pagina.datos, totalUbicaciones: pagina.total },
        [["zona_cambiada", zona]],
    ];
};

/** Recarga la página de ubicaciones de la zona (p. ej. tras generar ubicaciones de un pasillo). */
export const refrescarUbicaciones: ProcesarDetalle = async (contexto) => {
    const pagina = await getUbicacionesZona(contexto.zona.id, contexto.criteriaUbicaciones);
    return { ...contexto, ubicaciones: pagina.datos, totalUbicaciones: pagina.total };
};

/** El listado de ubicaciones cambia de página u orden: se pide esa página al servidor. */
export const cambiarCriteriaUbicaciones: ProcesarDetalle = async (contexto, payload) =>
    refrescarUbicaciones({ ...contexto, criteriaUbicaciones: payload as Criteria });

const activarPasilloPorId = (id: string | null): ProcesarDetalle => async (contexto) => ({
    ...contexto,
    pasillos: {
        ...contexto.pasillos,
        activo: contexto.pasillos.lista.find((p) => p.id === id) ?? null,
    },
});

/** Recarga los pasillos conservando el activo si sigue existiendo. */
export const refrescarPasillos: ProcesarDetalle = async (contexto) => {
    const lista = await getPasillosZona(contexto.zona.id);
    const activo = lista.find((p) => p.id === contexto.pasillos.activo?.id) ?? null;
    return { ...contexto, pasillos: { lista, total: lista.length, activo } };
};

export const onPasilloCreado: ProcesarDetalle = async (contexto, payload) =>
    pipeZona(contexto, [refrescarPasillos, activarPasilloPorId(payload as string)]);

export const onPasilloCambiado: ProcesarDetalle = async (contexto) =>
    pipeZona(contexto, [refrescarPasillos]);

export const onPasilloBorrado: ProcesarDetalle = async (contexto) =>
    pipeZona(contexto, [refrescarPasillos, refrescarUbicaciones]);

const cargarZona = (idZona: string): ProcesarDetalle =>
    async (contexto) => {
        const criteriaUbicaciones = criteriaUbicacionesInicial();
        const [zona, pagina, lista] = await Promise.all([
            getZona(idZona),
            getUbicacionesZona(idZona, criteriaUbicaciones),
            getPasillosZona(idZona),
        ]);
        return pipeZona(contexto, [
            async (ctx) => ({
                ...ctx,
                zona,
                ubicaciones: pagina.datos,
                totalUbicaciones: pagina.total,
                criteriaUbicaciones,
                pasillos: { lista, total: lista.length, activo: lista[0] ?? null },
            }),
            "ABIERTO",
        ]);
    };

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const idZona = payload as string;
    if (idZona) {
        return cargarZona(idZona)(contexto);
    }
    return {
        ...contexto,
        estado: "INICIAL",
        zona: zonaVaciaDetalle(),
        ubicaciones: [],
        totalUbicaciones: 0,
        criteriaUbicaciones: criteriaUbicacionesInicial(),
        pasillos: listaEntidadesInicial<Pasillo>(),
    };
};
