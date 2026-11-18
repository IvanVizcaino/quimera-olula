import { RestAPI } from "@olula/lib/api/rest_api.ts";
import {
    ArticuloAbc, ClaseAbc, GetAbc, GetPropuesta, GetRecolocacion, PropuestaUbicacion, Recolocacion, UbicacionPropuesta,
} from "./diseño.ts";
import { construirQuery } from "./dominio.ts";

const baseUrl = `/almacen/slotting`;

interface ArticuloAbcApi {
    articulo_id: string;
    descripcion: string;
    lineas: number;
    unidades: number;
    porcentaje_acumulado: number;
    clase: ClaseAbc;
}

interface UbicacionPropuestaApi {
    ubicacion_id: string;
    ubicacion: string;
    zona: string;
    accesibilidad: number;
    clase_ubicacion: ClaseAbc;
}

interface PropuestaUbicacionApi {
    articulo_id: string;
    clase: ClaseAbc;
    ubicaciones: UbicacionPropuestaApi[];
}

interface RecolocacionApi {
    articulo_id: string;
    clase: ClaseAbc;
    ubicacion: string;
    clase_ubicacion: ClaseAbc;
    accion: "INTERCAMBIAR" | "MOVER";
    con_articulo_id?: string | null;
    con_ubicacion?: string | null;
    beneficio: number;
}

export const articuloAbcDesdeApi = (a: ArticuloAbcApi): ArticuloAbc => ({
    articuloId: a.articulo_id,
    descripcion: a.descripcion,
    lineas: a.lineas,
    unidades: a.unidades,
    porcentajeAcumulado: a.porcentaje_acumulado,
    clase: a.clase,
});

const ubicacionPropuestaDesdeApi = (u: UbicacionPropuestaApi): UbicacionPropuesta => ({
    ubicacionId: u.ubicacion_id,
    ubicacion: u.ubicacion,
    zona: u.zona,
    accesibilidad: u.accesibilidad,
    claseUbicacion: u.clase_ubicacion,
});

export const propuestaDesdeApi = (p: PropuestaUbicacionApi): PropuestaUbicacion => ({
    articuloId: p.articulo_id,
    clase: p.clase,
    ubicaciones: (p.ubicaciones ?? []).map(ubicacionPropuestaDesdeApi),
});

export const recolocacionDesdeApi = (r: RecolocacionApi): Recolocacion => ({
    articuloId: r.articulo_id,
    clase: r.clase,
    ubicacion: r.ubicacion,
    claseUbicacion: r.clase_ubicacion,
    accion: r.accion,
    conArticuloId: r.con_articulo_id ?? null,
    conUbicacion: r.con_ubicacion ?? null,
    beneficio: r.beneficio,
});

export const getAbc: GetAbc = async (almacenId, dias) => {
    const q = construirQuery({ almacen_id: almacenId, dias });
    const r = await RestAPI.get<{ datos: ArticuloAbcApi[] }>(`${baseUrl}/abc${q}`, "Error al calcular el ABC");
    return r.datos.map(articuloAbcDesdeApi);
};

export const getPropuesta: GetPropuesta = async (almacenId, articuloId, limite) => {
    const q = construirQuery({ almacen_id: almacenId, articulo_id: articuloId, limite });
    const r = await RestAPI.get<{ datos: PropuestaUbicacionApi }>(
        `${baseUrl}/propuesta${q}`, "Error al proponer ubicación"
    );
    return propuestaDesdeApi(r.datos);
};

export const getRecolocacion: GetRecolocacion = async (almacenId, dias, limite) => {
    const q = construirQuery({ almacen_id: almacenId, dias, limite });
    const r = await RestAPI.get<{ datos: RecolocacionApi[] }>(
        `${baseUrl}/recolocacion${q}`, "Error al calcular la recolocación"
    );
    return r.datos.map(recolocacionDesdeApi);
};
