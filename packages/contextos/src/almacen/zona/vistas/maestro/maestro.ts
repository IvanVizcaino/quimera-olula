import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Zona } from "../../diseño.ts";
import { getZona, getZonas } from "../../infraestructura.ts";
import { ContextoMaestroZona, EstadoMaestroZona } from "./maquina.ts";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroZona, ContextoMaestroZona>;

const conZonas = (fn: ProcesarListaActivaEntidades<Zona>) =>
    (ctx: ContextoMaestroZona) => ({ ...ctx, zonas: fn(ctx.zonas) });

export const Zonas = accionesListaActivaEntidades(conZonas);

export const recargarZonas: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getZonas(criteria);
    return Zonas.recargar(contexto, resultado);
};

export const ampliarZonas: ProcesarMaestro = async (contexto, payload) => {
    const criteria = payload as Criteria;
    const resultado = await getZonas(criteria);
    return Zonas.ampliar(contexto, resultado);
};

export const incluirZonaCreadaPorId: ProcesarMaestro = async (contexto, payload) => {
    const id = payload as string;
    const zona = await getZona(id);
    return {
        ...contexto,
        estado: "INICIAL" as EstadoMaestroZona,
        zonas: {
            ...contexto.zonas,
            lista: [zona, ...contexto.zonas.lista],
            total: contexto.zonas.total + 1,
            activo: zona.id,
        },
    };
};
