import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { MetaModelo, stringNoVacio } from "@olula/lib/dominio.ts";
import { Ubicacion } from "../../diseño.ts";
import { getStocksUbicacion, getUbicacion } from "../../infraestructura.ts";
import { ContextoUbicacion, EstadoUbicacion } from "./diseño.ts";

type ProcesarUbicacion = ProcesarContexto<EstadoUbicacion, ContextoUbicacion>;

export const ubicacionVacia = (): Ubicacion => ({
    id: "",
    codigo: "",
    idZona: "",
    zona: "",
});

export const metaUbicacion: MetaModelo<Ubicacion> = {
    campos: {
        codigo: { requerido: true, validacion: (m: Ubicacion) => stringNoVacio(m.codigo) },
        idZona: { requerido: true, validacion: (m: Ubicacion) => stringNoVacio(m.idZona) },
    },
};

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
