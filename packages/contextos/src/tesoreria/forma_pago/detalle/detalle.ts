import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos } from "@olula/lib/dominio.ts";
import { CambiosFormaPago, FormaPago } from "../diseño.ts";
import { formaPagoVacia } from "../dominio.ts";
import { getFormaPago, patchFormaPago } from "../infraestructura.ts";
import { ContextoDetalleFormaPago, EstadoDetalleFormaPago } from "./diseño.ts";

type ProcesarDetalle = ProcesarContexto<EstadoDetalleFormaPago, ContextoDetalleFormaPago>;

const pipeFormaPago = ejecutarListaProcesos<EstadoDetalleFormaPago, ContextoDetalleFormaPago>;

const CAMPOS_EDITABLES = [
    "descripcion", "generaRecibos", "cuentaId", "domiciliado", "tipoPagoFacturae",
] as const;

export const contextoDetalleFormaPagoInicial: ContextoDetalleFormaPago = {
    estado: "INICIAL",
    formaPago: formaPagoVacia(),
};

export const cambiosFormaPago = (previa: FormaPago, actual: FormaPago): CambiosFormaPago => {
    const cambios: Record<string, unknown> = {};
    for (const campo of CAMPOS_EDITABLES) {
        if (actual[campo] !== previa[campo]) cambios[campo] = actual[campo];
    }
    return cambios as CambiosFormaPago;
};

export const guardarFormaPago = async (
    contexto: ContextoDetalleFormaPago,
    formaPago: FormaPago
): Promise<void> => {
    const cambios = cambiosFormaPago(contexto.formaPago, formaPago);
    if (Object.keys(cambios).length > 0) {
        await patchFormaPago(formaPago.id, cambios);
    }
};

export const refrescarFormaPago: ProcesarDetalle = async (contexto) => {
    const formaPago = await getFormaPago(contexto.formaPago.id);
    return [{ ...contexto, estado: "ABIERTO", formaPago }, [["forma_pago_cambiada", formaPago]]];
};

export const cargarFormaPago: (_: string) => ProcesarDetalle = (id) => async (contexto) => {
    const formaPago = await getFormaPago(id);
    return pipeFormaPago(contexto, [async (ctx) => ({ ...ctx, formaPago }), "ABIERTO"]);
};

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const id = payload as string;
    if (id) {
        return cargarFormaPago(id)(contexto);
    }
    return { ...contexto, estado: "INICIAL", formaPago: formaPagoVacia() };
};
