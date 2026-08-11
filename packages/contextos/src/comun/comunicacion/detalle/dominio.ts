import { EventoMaquina, ProcesarContexto } from "@olula/lib/diseño.js";
import { ejecutarListaProcesos, publicar } from "@olula/lib/dominio.js";
import { ESTADOS_COMUNICACION } from "../diseño.ts";
import { comunicacionVacia } from "../dominio.ts";
import {
    borrarComunicacion,
    getComunicacion,
    marcarComunicacionLeida,
    marcarComunicacionNoLeida,
} from "../infraestructura.ts";
import {
    ContextoDetalleComunicacion,
    EstadoDetalleComunicacion,
} from "./diseño.ts";

type ProcesarDetalleComunicacion = ProcesarContexto<
    EstadoDetalleComunicacion,
    ContextoDetalleComunicacion
>;

const pipeDetalleComunicacion = ejecutarListaProcesos<
    EstadoDetalleComunicacion,
    ContextoDetalleComunicacion
>;

const cargarComunicacion: (_: string) => ProcesarDetalleComunicacion =
    (idComunicacion) => async (contexto) => {
        let comunicacion = await getComunicacion(idComunicacion);
        const eventos: EventoMaquina[] = [];

        if (comunicacion.estado === ESTADOS_COMUNICACION.NO_LEIDA) {
            await marcarComunicacionLeida(idComunicacion);
            comunicacion = {
                ...comunicacion,
                estado: ESTADOS_COMUNICACION.LEIDA,
                fechaLectura: new Date(),
            };
            eventos.push(["comunicacion_cambiada", comunicacion]);
        }

        return [
            {
                ...contexto,
                comunicacion,
                comunicacionInicial: comunicacion,
            },
            eventos,
        ];
    };

export const abrirContexto: ProcesarDetalleComunicacion = async (contexto) => ({
    ...contexto,
    estado: "ABIERTO",
});

export const getContextoVacio: ProcesarDetalleComunicacion = async (contexto) => ({
    ...contexto,
    estado: "INICIAL",
    comunicacion: comunicacionVacia(),
    comunicacionInicial: comunicacionVacia(),
});

export const cargarContexto: ProcesarDetalleComunicacion = async (contexto, payload) => {
    const idComunicacion = payload as string;

    if (idComunicacion) {
        return pipeDetalleComunicacion(contexto, [
            cargarComunicacion(idComunicacion),
            abrirContexto,
        ]);
    }

    return getContextoVacio(contexto);
};

export const borrarComunicacionProceso: ProcesarDetalleComunicacion = async (contexto) => {
    await borrarComunicacion(contexto.comunicacion.id);

    return pipeDetalleComunicacion(contexto, [
        getContextoVacio,
        publicar("comunicacion_borrada", contexto.comunicacion.id),
    ]);
};

export const marcarNoLeidaProceso: ProcesarDetalleComunicacion = async (contexto) => {
    await marcarComunicacionNoLeida(contexto.comunicacion.id);

    const comunicacion = {
        ...contexto.comunicacion,
        estado: ESTADOS_COMUNICACION.NO_LEIDA,
        fechaLectura: null,
    };

    return pipeDetalleComunicacion(
        { ...contexto, comunicacion, comunicacionInicial: comunicacion },
        [
            publicar("comunicacion_cambiada", comunicacion),
            getContextoVacio,
            publicar("comunicacion_deseleccionada", null),
        ]
    );
};