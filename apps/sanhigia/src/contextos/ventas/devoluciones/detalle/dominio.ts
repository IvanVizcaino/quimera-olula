import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { LineaDevolucionPedido } from "../diseño.ts";
import {
    getDevolucionPedido,
    getLineasDevolucionPedido,
    prepararDevolucionPedido,
} from "../infraestructura.ts";
import {
    ContextoDetalleDevolucionPedido,
    EstadoDetalleDevolucionPedido,
    contextoDetalleDevolucionPedidoVacio,
} from "./diseño.ts";

export type ProcesarDetalleDevolucionPedido = ProcesarContexto<
    EstadoDetalleDevolucionPedido,
    ContextoDetalleDevolucionPedido
>;

const erroresLineas = (lineas: LineaDevolucionPedido[]): Record<string, string> => {
    return lineas.reduce<Record<string, string>>((acc, linea) => {
        if (linea.cantidadOk < 0 || linea.cantidadKo < 0) {
            acc[linea.id] = "Las cantidades no pueden ser negativas.";
            return acc;
        }

        if (linea.cantidadOk + linea.cantidadKo > linea.cantidad) {
            acc[linea.id] = "La suma de correcta y dañada no puede superar la cantidad.";
        }

        return acc;
    }, {});
};

const normalizarLinea = (linea: LineaDevolucionPedido): LineaDevolucionPedido => {
    const cantidadOk = Number.isNaN(Number(linea.cantidadOk)) ? 0 : Number(linea.cantidadOk);
    const cantidadKo = Number.isNaN(Number(linea.cantidadKo)) ? 0 : Number(linea.cantidadKo);

    return {
        ...linea,
        cantidadOk,
        cantidadKo,
        cantidadDevolver: cantidadOk + cantidadKo,
    };
};

const actualizarLinea = (
    contexto: ContextoDetalleDevolucionPedido,
    payload: unknown,
    campo: "cantidadOk" | "cantidadKo"
): ContextoDetalleDevolucionPedido => {
    const datos = payload as { idLinea?: string; valor?: number };
    if (!datos?.idLinea) return contexto;

    const valor = Number(datos.valor ?? 0);
    const valorNormalizado = Number.isNaN(valor) ? 0 : valor;

    const lineas = contexto.lineas.map((linea) => {
        if (linea.id !== datos.idLinea) return linea;
        return normalizarLinea({
            ...linea,
            [campo]: valorNormalizado,
        });
    });

    return {
        ...contexto,
        lineas,
        erroresLineas: erroresLineas(lineas),
    };
};

export const cargarDetalleDevolucionPedido: ProcesarDetalleDevolucionPedido = async (_contexto, payload) => {
    const idPedido = String(payload ?? "");

    if (!idPedido) {
        return contextoDetalleDevolucionPedidoVacio;
    }

    try {
        const [devolucion, lineasBase] = await Promise.all([
            getDevolucionPedido(idPedido),
            getLineasDevolucionPedido(idPedido),
        ]);

        const lineas = lineasBase.map(normalizarLinea);

        return {
            estado: "ABIERTO",
            devolucion,
            lineas,
            erroresLineas: erroresLineas(lineas),
            error: "",
        };
    } catch (error) {
        console.log(error);
        return {
            ...contextoDetalleDevolucionPedidoVacio,
            error: "No se ha podido cargar la devolución.",
        };
    }
};

export const cambiarCantidadOkDetalleDevolucionPedido: ProcesarDetalleDevolucionPedido = async (contexto, payload) => {
    return actualizarLinea(contexto, payload, "cantidadOk");
};

export const cambiarCantidadKoDetalleDevolucionPedido: ProcesarDetalleDevolucionPedido = async (contexto, payload) => {
    return actualizarLinea(contexto, payload, "cantidadKo");
};

export const limpiarCantidadesDetalleDevolucionPedido: ProcesarDetalleDevolucionPedido = async (contexto, payload) => {
    const datos = payload as { idLinea?: string };
    if (!datos?.idLinea) return contexto;

    const lineas = contexto.lineas.map((linea) => {
        if (linea.id !== datos.idLinea) return linea;
        return normalizarLinea({
            ...linea,
            cantidadOk: 0,
            cantidadKo: 0,
        });
    });

    return {
        ...contexto,
        lineas,
        erroresLineas: erroresLineas(lineas),
    };
};

export const solicitarConfirmacionPrepararDetalleDevolucionPedido: ProcesarDetalleDevolucionPedido = async (contexto) => ({
    ...contexto,
    estado: "CONFIRMANDO_PREPARAR",
    error: "",
});

export const cancelarConfirmacionPrepararDetalleDevolucionPedido: ProcesarDetalleDevolucionPedido = async (contexto) => ({
    ...contexto,
    estado: "ABIERTO",
});

export const prepararDetalleDevolucionPedido: ProcesarDetalleDevolucionPedido = async (contexto) => {
    if (!contexto.devolucion) {
        return contexto;
    }

    if (Object.keys(contexto.erroresLineas).length > 0) {
        return {
            ...contexto,
            error: "Hay líneas con cantidades inválidas.",
        };
    }

    const devolucionPreparada = await prepararDevolucionPedido({
        idPedido: contexto.devolucion.id,
        lineasDevolucion: contexto.lineas,
    });

    return [
        {
            ...contexto,
            estado: "ABIERTO",
            devolucion: devolucionPreparada,
            error: "",
        },
        [["devolucion_actualizada", devolucionPreparada]],
    ];
};
