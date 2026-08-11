import { ProcesarContexto } from "@olula/lib/diseño.js";
import { ejecutarListaProcesos, publicar } from "@olula/lib/dominio.js";
import { getJornada } from "../infraestructura.ts";
import { ContextoDetalleJornada, EstadoDetalleJornada, jornadaVacia } from "./diseño.ts";

type ProcesarJornada = ProcesarContexto<EstadoDetalleJornada, ContextoDetalleJornada>;

const pipeJornada = ejecutarListaProcesos<EstadoDetalleJornada, ContextoDetalleJornada>;

const cargarJornada: (_: string) => ProcesarJornada = (idJornada) =>
    async (contexto) => {
        const jornada = await getJornada(idJornada);
        return {
            ...contexto,
            jornada,
        };
    };

export const jornadaAEstado = (jornada: ContextoDetalleJornada['jornada']): EstadoDetalleJornada => {
    switch (jornada.estado) {
        case 'BORRADOR': return 'BORRADOR';
        case 'APROBADA': return 'APROBADA';
        case 'ANULADA': return 'ANULADA';
        default: return 'BORRADOR';
    }
};

export const determinarEstado: ProcesarJornada = async (contexto) => {
    return {
        ...contexto,
        estado: jornadaAEstado(contexto.jornada),
    };
};

export const refrescarJornada: ProcesarJornada = async (contexto) => {
    const jornada = await getJornada(contexto.jornada.id);
    return [
        {
            ...contexto,
            jornada,
        },
        [["jornada_cambiada", jornada]],
    ];
};

export const anularJornada: ProcesarJornada = async (contexto) => {
    const idJornada = contexto.jornada.id;
    return pipeJornada(contexto, [
        getContextoVacio,
        publicar('jornada_anulada', idJornada),
    ]);
};

export const getContextoVacio: ProcesarJornada = async (contexto) => {
    return {
        ...contexto,
        estado: 'INICIAL' as EstadoDetalleJornada,
        jornada: jornadaVacia,
        pausaActiva: null,
    };
};

export const cargarContexto: ProcesarJornada = async (contexto, payload) => {
    const idJornada = payload as string;
    if (idJornada) {
        return pipeJornada(
            contexto,
            [
                cargarJornada(idJornada),
                determinarEstado,
            ],
            payload
        );
    } else {
        return getContextoVacio(contexto);
    }
};

export const onJornadaBorrada: ProcesarJornada = async (contexto) => {
    const jornada = contexto.jornada;
    return pipeJornada(contexto, [
        getContextoVacio,
        publicar('jornada_deseleccionada', jornada.id),
    ]);
};
