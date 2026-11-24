import { Criteria, Entidad, Maquina, ProcesarContexto } from "@olula/lib/diseño.ts";
import {
    accionesListaActivaEntidades,
    ListaActivaEntidades,
    ProcesarListaActivaEntidades,
} from "@olula/lib/ListaActivaEntidades.js";
import { ConsultasMaestro } from "./diseño.ts";

export type EstadoMaestroSimple = "INICIAL" | "CREANDO";

export type ContextoMaestroSimple<T extends Entidad> = {
    estado: EstadoMaestroSimple;
    entidades: ListaActivaEntidades<T>;
};

/**
 * Máquina común de los maestros sencillos de producción (la de `almacen/peso_medida` con
 * nombres de evento genéricos). Eventos que publica el detalle: `entidad_cambiada`,
 * `entidad_borrada`, `entidad_deseleccionada` y `entidad_creada` (una copia); el alta:
 * `entidad_creada` y `alta_cancelada`.
 */
export const getMaquinaMaestroSimple = <T extends Entidad>(consultas: ConsultasMaestro<T>) => {
    type Ctx = ContextoMaestroSimple<T>;
    type Procesar = ProcesarContexto<EstadoMaestroSimple, Ctx>;

    const conEntidades = (fn: ProcesarListaActivaEntidades<T>) =>
        (ctx: Ctx) => ({ ...ctx, entidades: fn(ctx.entidades) });

    const Entidades = accionesListaActivaEntidades(conEntidades);

    const recargar: Procesar = async (contexto, payload) =>
        Entidades.recargar(contexto, await consultas.getLista(payload as Criteria));

    const ampliar: Procesar = async (contexto, payload) =>
        Entidades.ampliar(contexto, await consultas.getLista(payload as Criteria));

    const incluirCreada: Procesar = async (contexto, payload) => {
        const entidad = await consultas.getUno(payload as string);
        return {
            ...contexto,
            estado: "INICIAL" as EstadoMaestroSimple,
            entidades: {
                ...contexto.entidades,
                lista: [entidad, ...contexto.entidades.lista],
                total: contexto.entidades.total + 1,
                activo: entidad.id,
            },
        };
    };

    return (): Maquina<EstadoMaestroSimple, Ctx> => ({
        INICIAL: {
            entidad_seleccionada: [Entidades.activar],
            entidad_deseleccionada: [Entidades.desactivar],
            entidad_cambiada: [Entidades.cambiar],
            entidad_borrada: [Entidades.quitar],
            recarga_solicitada: recargar,
            criteria_cambiado: [Entidades.filtrar, recargar],
            siguiente_pagina: [Entidades.filtrar, ampliar],
            entidad_creada: incluirCreada,
            crear_solicitado: "CREANDO",
        },
        CREANDO: {
            alta_cancelada: "INICIAL",
            entidad_creada: incluirCreada,
        },
    });
};
