import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ubicacionVacia } from "../../dominio.ts";
import { getStocksUbicacion, getUbicacion } from "../../infraestructura.ts";
import { ContextoUbicacion, EstadoUbicacion } from "./diseño.ts";

type ProcesarUbicacion = ProcesarContexto<EstadoUbicacion, ContextoUbicacion>;

export const cargarContexto: ProcesarUbicacion = async (contexto, payload) => {
    const id = payload as string;
    if (!id) return { ...contexto, estado: "INICIAL", ubicacion: ubicacionVacia(), stocks: [] };

    const [ubicacion, stocks] = await Promise.all([getUbicacion(id), getStocksUbicacion(id)]);
    return {
        ...contexto,
        estado: "ABIERTO",
        ubicacion,
        stocks,
    };
};

export const refrescarUbicacion: ProcesarUbicacion = async (contexto) => {
    const [ubicacion, stocks] = await Promise.all([
        getUbicacion(contexto.ubicacion.id),
        getStocksUbicacion(contexto.ubicacion.id),
    ]);
    return [
        {
            ...contexto,
            ubicacion,
            stocks,
        },
        [["ubicacion_cambiada", ubicacion]],
    ];
};
