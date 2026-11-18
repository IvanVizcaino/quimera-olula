import { Criteria, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Provincia } from "../diseño.ts";
import { getProvincia, getProvinciasMaestro } from "../infraestructura.ts";
import { ContextoMaestroProvincia, EstadoMaestroProvincia } from "./diseño.ts";

type ProcesarMaestro = ProcesarContexto<EstadoMaestroProvincia, ContextoMaestroProvincia>;

const conProvincias = (fn: ProcesarListaActivaEntidades<Provincia>) =>
    (ctx: ContextoMaestroProvincia) => ({
        ...ctx,
        provincias: fn(ctx.provincias),
    });

export const Provincias = accionesListaActivaEntidades(conProvincias);

export const recargarProvincias: ProcesarMaestro = async (contexto, payload) => {
    const criteria = (payload as Criteria | undefined) ?? contexto.provincias.criteria;
    const resultado = await getProvinciasMaestro(criteria);
    return Provincias.recargar(contexto, resultado);
};

export const ampliarProvincias: ProcesarMaestro = async (contexto, payload) => {
    const resultado = await getProvinciasMaestro(payload as Criteria);
    return Provincias.ampliar(contexto, resultado);
};

export const incluirProvinciaCreadoPorId: ProcesarMaestro = async (contexto, payload) => {
    const provincia = await getProvincia(payload as string);
    return {
        ...contexto,
        estado: "INICIAL",
        provincias: {
            ...contexto.provincias,
            lista: [provincia, ...contexto.provincias.lista],
            total: contexto.provincias.total + 1,
            activo: provincia.id,
        },
    };
};
