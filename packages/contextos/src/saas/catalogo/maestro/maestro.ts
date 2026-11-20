import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ExtraCatalogo, LimiteCatalogo, ModuloCatalogo } from "../diseño.js";
import { getAjustes, getCatalogo, putAjustes } from "../infraestructura.js";
import { ContextoMaestroCatalogo, EstadoMaestroCatalogo } from "./diseño.js";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroCatalogo, ContextoMaestroCatalogo>;

export const contextoMaestroCatalogoInicial: ContextoMaestroCatalogo = {
    estado: "INICIAL",
    catalogo: null,
    ajustes: null,
    modulo: null,
    limite: null,
    extra: null,
};

/** Recarga el catálogo y cierra cualquier modal: tras cada cambio se relee todo (los planes dependen de él). */
export const recargarCatalogo: ProcesarMaestro = async (contexto) => ({
    ...contexto,
    estado: "INICIAL",
    catalogo: await getCatalogo(),
    ajustes: await getAjustes().catch(() => contexto.ajustes),
    modulo: null,
    limite: null,
    extra: null,
});

export const seleccionarModulo: ProcesarMaestro = async (contexto, payload) => ({
    ...contexto, modulo: payload as ModuloCatalogo,
});

/** `payload` null = alta. */
export const seleccionarLimite: ProcesarMaestro = async (contexto, payload) => ({
    ...contexto, limite: (payload as LimiteCatalogo | null) ?? null,
});

export const seleccionarExtra: ProcesarMaestro = async (contexto, payload) => ({
    ...contexto, extra: (payload as ExtraCatalogo | null) ?? null,
});

/** `payload`: id del grupo de IVA de producto de las cuotas. */
export const guardarIvaCuotas: ProcesarMaestro = async (contexto, payload) => ({
    ...contexto, ajustes: await putAjustes(payload as string),
});
