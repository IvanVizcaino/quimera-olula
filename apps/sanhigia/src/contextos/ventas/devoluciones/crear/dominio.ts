import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { MetaModelo } from "@olula/lib/dominio.ts";
import { MotivoDevolucion } from "../../motivoDevolucion/diseño.ts";
import { getFacturaDevolucion } from "../infraestructura.ts";
import {
    ContextoCrearDevolucion,
    EstadoCrearDevolucion,
    FacturaSeleccionada,
    FormCrearDevolucion,
    contextoCrearDevolucionVacio,
} from "./diseño.ts";

export const formCrearDevolucionVacio: FormCrearDevolucion = {
    razonDevolucion: "",
};

export const metaFormCrearDevolucion: MetaModelo<FormCrearDevolucion> = {
    campos: {
        razonDevolucion: { requerido: true },
    },
};

export type ProcesarCrearDevolucion = ProcesarContexto<
    EstadoCrearDevolucion,
    ContextoCrearDevolucion
>;

export const seleccionarFacturaProceso: ProcesarCrearDevolucion = async (contexto, payload) => {
    return {
        ...contexto,
        facturaSeleccionada: (payload as FacturaSeleccionada | null) ?? null,
        error: "",
    };
};

export const buscarFacturaProceso: ProcesarCrearDevolucion = async (contexto, payload) => {
    const idFactura = String(
        payload ?? contexto.facturaSeleccionada?.valor ?? ""
    );

    if (!idFactura) {
        return {
            ...contexto,
            error: "Indica un identificador de factura",
        };
    }

    try {
        const factura = await getFacturaDevolucion(idFactura);
        return {
            ...contexto,
            estado: "EDITANDO_DEVOLUCION",
            factura,
            motivoSeleccionado: null,
            descripcionMotivo: "",
            error: "",
        };
    } catch {
        return {
            ...contexto,
            estado: "SELECCIONANDO_FACTURA",
            factura: null,
            error: "No se ha podido cargar la factura",
        };
    }
};

export const volverABusquedaProceso: ProcesarCrearDevolucion = async (contexto) => ({
    ...contexto,
    estado: "SELECCIONANDO_FACTURA",
    factura: null,
    motivoSeleccionado: null,
    descripcionMotivo: "",
    error: "",
});

export const solicitarConfirmacionMotivoProceso: ProcesarCrearDevolucion = async (contexto) => ({
    ...contexto,
    estado: "SELECCIONANDO_MOTIVO",
    error: "",
});

export const cancelarConfirmacionMotivoProceso: ProcesarCrearDevolucion = async (contexto) => ({
    ...contexto,
    estado: "EDITANDO_DEVOLUCION",
    error: "",
});

export const seleccionarMotivoProceso: ProcesarCrearDevolucion = async (contexto, payload) => {
    const motivo = (payload as MotivoDevolucion | null) ?? null;

    return {
        ...contexto,
        motivoSeleccionado: motivo,
        descripcionMotivo: String(motivo?.descripcion ?? ""),
    };
};

export const cambiarDescripcionMotivoProceso: ProcesarCrearDevolucion = async (contexto, payload) => ({
    ...contexto,
    descripcionMotivo: String(payload ?? ""),
});

export const solicitarGuardadoProceso: ProcesarCrearDevolucion = async (contexto) => ({
    ...contexto,
    estado: "GUARDANDO_DEVOLUCION",
    error: "",
});

export const guardadoCompletadoProceso: ProcesarCrearDevolucion = async () => contextoCrearDevolucionVacio;

export const guardadoFallidoProceso: ProcesarCrearDevolucion = async (contexto) => ({
    ...contexto,
    estado: "SELECCIONANDO_MOTIVO",
    error: "No se ha podido crear la devolución",
});

export const limpiarFacturaProceso: ProcesarCrearDevolucion = async () => contextoCrearDevolucionVacio;
