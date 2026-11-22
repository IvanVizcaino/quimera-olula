import { Criteria, Entidad, Maquina, Modelo, ProcesarContexto } from "@olula/lib/diseño.ts";
import { accionesListaActivaEntidades, ProcesarListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { ConfigMaestroFiscal, ContextoMaestroFiscal, EstadoMaestroFiscal } from "./diseño.ts";
import { getLista, getUno } from "./infraestructura.ts";

type Procesar<T extends Entidad> = ProcesarContexto<EstadoMaestroFiscal, ContextoMaestroFiscal<T>>;

export const getMaquinaMaestroFiscal = <T extends Entidad & Modelo, N extends Modelo>(
    config: ConfigMaestroFiscal<T, N>,
): Maquina<EstadoMaestroFiscal, ContextoMaestroFiscal<T>> => {

    const conEntidades = (fn: ProcesarListaActivaEntidades<T>) =>
        (ctx: ContextoMaestroFiscal<T>) => ({ ...ctx, entidades: fn(ctx.entidades) });

    const Lista = accionesListaActivaEntidades(conEntidades);

    const recargar: Procesar<T> = async (contexto, payload) => {
        const criteria = (payload as Criteria | undefined) ?? contexto.entidades.criteria;
        return Lista.recargar(contexto, await getLista(config, criteria));
    };

    const ampliar: Procesar<T> = async (contexto, payload) =>
        Lista.ampliar(contexto, await getLista(config, payload as Criteria));

    const incluirCreada: Procesar<T> = async (contexto, payload) => {
        const entidad = await getUno(config, payload as string);
        return {
            ...contexto,
            estado: "INICIAL",
            entidades: {
                ...contexto.entidades,
                lista: [entidad, ...contexto.entidades.lista],
                total: contexto.entidades.total + 1,
                activo: entidad.id,
            },
        };
    };

    return {
        INICIAL: {
            entidad_seleccionada: [Lista.activar],
            entidad_deseleccionada: [Lista.desactivar],
            entidad_cambiada: [Lista.cambiar],
            entidad_borrada: [Lista.quitar],
            recarga_solicitada: recargar,
            criteria_cambiado: [Lista.filtrar, recargar],
            siguiente_pagina: [Lista.filtrar, ampliar],
            crear_solicitado: "CREANDO",
        },
        CREANDO: {
            alta_cancelada: "INICIAL",
            entidad_creada: incluirCreada,
        },
    };
};
