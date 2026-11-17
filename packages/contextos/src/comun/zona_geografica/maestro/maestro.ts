import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { ZonaGeografica } from "../diseño.ts";
import { getZonaGeografica, getZonasGeograficasMaestro } from "../infraestructura.ts";
import { ContextoMaestroZonaGeografica, EstadoMaestroZonaGeografica } from "./diseño.ts";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroZonaGeografica, ContextoMaestroZonaGeografica>;

const conZonasGeograficas = (fn: ProcesarListaActivaEntidades<ZonaGeografica>) =>
    (ctx: ContextoMaestroZonaGeografica) => ({
        ...ctx,
        zonasGeograficas: fn(ctx.zonasGeograficas),
    });

export const ZonasGeograficas = accionesListaActivaEntidades(conZonasGeograficas);

export const recargarZonasGeograficas: ProcesarMaestro = async (contexto, payload) => {
    const criteria = (payload as Criteria | undefined) ?? contexto.zonasGeograficas.criteria;
    const resultado = await getZonasGeograficasMaestro(criteria);
    return ZonasGeograficas.recargar(contexto, resultado);
};

export const ampliarZonasGeograficas: ProcesarMaestro = async (contexto, payload) => {
    const resultado = await getZonasGeograficasMaestro(payload as Criteria);
    return ZonasGeograficas.ampliar(contexto, resultado);
};

export const incluirZonaGeograficaCreadoPorId: ProcesarMaestro = async (contexto, payload) => {
    const zonaGeografica = await getZonaGeografica(payload as string);
    return {
        ...contexto,
        estado: "INICIAL",
        zonasGeograficas: {
            ...contexto.zonasGeograficas,
            lista: [zonaGeografica, ...contexto.zonasGeograficas.lista],
            total: contexto.zonasGeograficas.total + 1,
            activo: zonaGeografica.id,
        },
    };
};
