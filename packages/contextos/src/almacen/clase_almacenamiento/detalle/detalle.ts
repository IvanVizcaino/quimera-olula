import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { claseAlmacenamientoVacia } from "../dominio.ts";
import { getClaseAlmacenamiento } from "../infraestructura.ts";
import { ContextoDetalleClaseAlmacenamiento, EstadoDetalleClaseAlmacenamiento } from "./maquina.ts";

type ProcesarDetalle = ProcesarContexto<EstadoDetalleClaseAlmacenamiento, ContextoDetalleClaseAlmacenamiento>;

export const contextoDetalleClaseAlmacenamientoInicial: ContextoDetalleClaseAlmacenamiento = {
    estado: "INICIAL",
    clase: claseAlmacenamientoVacia(),
};

export const refrescarClase: ProcesarDetalle = async (contexto) => {
    const clase = await getClaseAlmacenamiento(contexto.clase.id);
    return [
        { ...contexto, clase },
        [["clase_almacenamiento_cambiada", clase]],
    ];
};

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const id = payload as string;
    if (!id) {
        return { ...contexto, estado: "INICIAL", clase: claseAlmacenamientoVacia() };
    }
    const clase = await getClaseAlmacenamiento(id);
    return { ...contexto, estado: "ABIERTO", clase };
};
