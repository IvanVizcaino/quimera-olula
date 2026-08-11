import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos, MetaModelo, stringNoVacio } from "@olula/lib/dominio.ts";
import { Zona } from "../../diseño.ts";
import { getUbicacionesZona, getZona } from "../../infraestructura.ts";
import { ContextoDetalleZona, EstadoDetalleZona } from "./diseño.ts";

type ProcesarDetalle = ProcesarContexto<EstadoDetalleZona, ContextoDetalleZona>;

const pipeZona = ejecutarListaProcesos<EstadoDetalleZona, ContextoDetalleZona>;

export const metaZona: MetaModelo<Zona> = {
    campos: {
        codigo: { requerido: true, validacion: (m: Zona) => stringNoVacio(m.codigo) },
        almacenId: { requerido: true, validacion: (m: Zona) => stringNoVacio(m.almacenId) },
        descripcion: { requerido: false },
    },
};

export const zonaVaciaDetalle = (): Zona => ({
    id: "",
    codigo: "",
    almacenId: "",
    descripcion: null,
});

export const contextoDetalleZonaInicial: ContextoDetalleZona = {
    estado: "INICIAL",
    zona: zonaVaciaDetalle(),
    ubicaciones: [],
};

export const refrescarZona: ProcesarDetalle = async (contexto) => {
    const [zona, ubicaciones] = await Promise.all([
        getZona(contexto.zona.id),
        getUbicacionesZona(contexto.zona.id),
    ]);
    return [
        { ...contexto, zona, ubicaciones },
        [["zona_cambiada", zona]],
    ];
};

const cargarZona = (idZona: string): ProcesarDetalle =>
    async (contexto) => {
        const [zona, ubicaciones] = await Promise.all([
            getZona(idZona),
            getUbicacionesZona(idZona),
        ]);
        return pipeZona(contexto, [
            async (ctx) => ({ ...ctx, zona, ubicaciones }),
            "ABIERTO",
        ]);
    };

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const idZona = payload as string;
    if (idZona) {
        return cargarZona(idZona)(contexto);
    }
    return { ...contexto, estado: "INICIAL", zona: zonaVaciaDetalle(), ubicaciones: [] };
};
