import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { LineaFacturaDevolucion } from "../../diseño.ts";
import {
    ContextoLineasDevolucion,
    EstadoLineasDevolucion,
} from "./diseño.ts";

type ProcesarLineasDevolucion = ProcesarContexto<
    EstadoLineasDevolucion,
    ContextoLineasDevolucion
>;

type PayloadCantidadAplicada = {
    idLinea: string;
    valor: string;
};

const normalizarLineas = (lineas: LineaFacturaDevolucion[]) =>
    lineas.map((linea) => ({
        ...linea,
        cantidadDevolver: Number(linea.cantidadDevolver ?? 0),
    }));

const crearBorradores = (lineas: LineaFacturaDevolucion[]) =>
    lineas.reduce<Record<string, string>>(
        (acc, linea) => ({
            ...acc,
            [linea.id]: String(linea.cantidadDevolver ?? 0),
        }),
        {}
    );

export const cargarLineasProceso: ProcesarLineasDevolucion = async (
    contexto,
    payload
) => {
    const lineasEntrada = Array.isArray(payload)
        ? (payload as LineaFacturaDevolucion[])
        : [];
    const lineas = normalizarLineas(lineasEntrada);

    return {
        ...contexto,
        lineas,
        borradoresCantidad: crearBorradores(lineas),
    };
};

export const aplicarCantidadProceso: ProcesarLineasDevolucion = async (
    contexto,
    payload
) => {
    const { idLinea, valor } = (payload as PayloadCantidadAplicada) ?? {
        idLinea: "",
        valor: "0",
    };

    const lineaObjetivo = contexto.lineas.find((linea) => linea.id === idLinea);
    if (!lineaObjetivo) return contexto;

    const bruto = String(valor ?? "0").replace(",", ".");
    const valorNumerico = Number(bruto);
    const cantidadNormalizada = Number.isNaN(valorNumerico)
        ? 0
        : Math.max(0, Math.min(valorNumerico, lineaObjetivo.cantidad));

    const lineas = contexto.lineas.map((linea) => {
        if (linea.id !== idLinea) return linea;

        return {
            ...linea,
            cantidadDevolver: cantidadNormalizada,
        };
    });

    return {
        ...contexto,
        lineas,
        borradoresCantidad: {
            ...contexto.borradoresCantidad,
            [idLinea]: String(cantidadNormalizada),
        },
    };
};

export const aplicarCantidadMaximaProceso: ProcesarLineasDevolucion = async (
    contexto,
    payload
) => {
    const idLinea = String(payload ?? "");
    const lineas = contexto.lineas.map((linea) => {
        if (linea.id !== idLinea) return linea;
        const cantidad = linea.esKit ? 0 : linea.cantidad;
        return { ...linea, cantidadDevolver: cantidad };
    });

    return {
        ...contexto,
        lineas,
        borradoresCantidad: crearBorradores(lineas),
    };
};

export const aplicarDevolucionTotalProceso: ProcesarLineasDevolucion = async (
    contexto
) => {
    const lineas = contexto.lineas.map((linea) => ({
        ...linea,
        cantidadDevolver: linea.esKit ? 0 : linea.cantidad,
    }));

    return {
        ...contexto,
        lineas,
        borradoresCantidad: crearBorradores(lineas),
    };
};
