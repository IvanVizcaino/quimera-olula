import { ClaseAbc } from "#/almacen/slotting/diseño.ts";
import { construirQuery } from "#/almacen/slotting/dominio.ts";
import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { CarasPasillo, GetMapa, MapaAlmacen, UbicacionMapa, ZonaMapa } from "./diseño.ts";

const baseUrl = `/almacen/mapa`;

interface PasilloMapaApi {
    pasillo_id: string;
    pasillo: string;
    orden: number;
    caras: CarasPasillo;
    modulos: number;
    accesos: string;
    niveles: number;
}

interface ZonaMapaApi {
    zona_id: string;
    zona: string;
    funcion: string;
    pasillos: PasilloMapaApi[];
}

interface UbicacionMapaApi {
    ubicacion_id: string;
    ubicacion: string;
    zona_id: string;
    pasillo_id: string | null;
    modulo: number | null;
    nivel: number | null;
    hueco: number | null;
    formato: string | null;
    bloqueada: boolean;
    cantidad: number;
    articulos: string[];
    clase_articulo: ClaseAbc | null;
    clases_almacenamiento: string[];
    accesibilidad: number | null;
    clase_ubicacion: ClaseAbc | null;
    picking_fijo: { articulo_id: string; minimo: number; maximo: number } | null;
}

interface MapaAlmacenApi {
    zonas: ZonaMapaApi[];
    ubicaciones: UbicacionMapaApi[];
}

const zonaDesdeApi = (z: ZonaMapaApi): ZonaMapa => ({
    zonaId: z.zona_id,
    zona: z.zona,
    funcion: z.funcion,
    pasillos: z.pasillos.map((p) => ({
        pasilloId: p.pasillo_id,
        pasillo: p.pasillo,
        orden: p.orden,
        caras: p.caras,
        modulos: p.modulos,
        accesos: p.accesos,
        niveles: p.niveles,
    })),
});

const ubicacionDesdeApi = (u: UbicacionMapaApi): UbicacionMapa => ({
    ubicacionId: u.ubicacion_id,
    ubicacion: u.ubicacion,
    zonaId: u.zona_id,
    pasilloId: u.pasillo_id,
    modulo: u.modulo,
    nivel: u.nivel,
    hueco: u.hueco,
    formato: u.formato,
    bloqueada: u.bloqueada,
    cantidad: u.cantidad,
    articulos: u.articulos,
    claseArticulo: u.clase_articulo,
    clasesAlmacenamiento: u.clases_almacenamiento,
    accesibilidad: u.accesibilidad,
    claseUbicacion: u.clase_ubicacion,
    pickingFijo: u.picking_fijo
        ? { articuloId: u.picking_fijo.articulo_id, minimo: u.picking_fijo.minimo, maximo: u.picking_fijo.maximo }
        : null,
});

export const mapaDesdeApi = (m: MapaAlmacenApi): MapaAlmacen => ({
    zonas: m.zonas.map(zonaDesdeApi),
    ubicaciones: m.ubicaciones.map(ubicacionDesdeApi),
});

export const getMapa: GetMapa = async (almacenId, dias, origen) => {
    const respuesta = await RestAPI.get<{ datos: MapaAlmacenApi }>(
        baseUrl + construirQuery({ almacen_id: almacenId, dias, origen })
    );
    return mapaDesdeApi(respuesta.datos);
};
