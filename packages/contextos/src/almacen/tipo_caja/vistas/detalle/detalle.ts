import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos, MetaModelo } from "@olula/lib/dominio.ts";
import { TipoCaja } from "../../diseño.js";
import { getTipoCaja, patchTipoCaja } from "../../infraestructura.js";
import { tipoCajaInicial } from "../../dominio.js";
import { ContextoDetalleTipoCaja, EstadoDetalleTipoCaja } from "./maquina.js";

/**
 * Tipo para handlers del detalle
 */
type ProcesarDetalle = ProcesarContexto<EstadoDetalleTipoCaja, ContextoDetalleTipoCaja>;

const pipeTipoCaja = ejecutarListaProcesos<EstadoDetalleTipoCaja, ContextoDetalleTipoCaja>;

/**
 * Metadatos del formulario del detalle.
 * Solo descripcion es editable directamente (sku/capacidad se cambian desde el modal).
 */
export const metaTipoCaja: MetaModelo<TipoCaja> = {
    campos: {
        descripcion: { requerido: true },
        sku: { requerido: false },
        capacidad: { requerido: false, tipo: "decimal" },
        prefijo: { requerido: false },
    },
};

export const contextoDetalleTipoCajaInicial: ContextoDetalleTipoCaja = {
    estado: "INICIAL",
    tipoCaja: tipoCajaInicial(),
};

/**
 * Refresca el tipo de caja desde la API y propaga el cambio al maestro.
 */
export const refrescarTipoCaja: ProcesarDetalle = async (contexto) => {
    const tipoCaja = await getTipoCaja(contexto.tipoCaja.id);
    return [
        { ...contexto, tipoCaja },
        [["tipo_caja_cambiado", tipoCaja]],  // propaga al maestro
    ];
};

/**
 * Guarda solo la descripcion si ha cambiado.
 * Se llama desde el auto-guardado de useModelo.
 */
export const guardarTipoCaja = async (
    contexto: ContextoDetalleTipoCaja,
    tipoCaja: TipoCaja
): Promise<void> => {
    const cambios: Partial<TipoCaja> = {};
    if (tipoCaja.descripcion !== contexto.tipoCaja.descripcion) {
        cambios.descripcion = tipoCaja.descripcion;
    }
    if (tipoCaja.prefijo !== contexto.tipoCaja.prefijo) {
        cambios.prefijo = tipoCaja.prefijo;
    }
    if (Object.keys(cambios).length > 0) {
        await patchTipoCaja(tipoCaja.id, cambios);
    }
};

/**
 * Carga el tipo de caja desde la API y activa el estado ABIERTO.
 */
export const cargarTipoCaja: (_: string) => ProcesarDetalle =
    (idTipoCaja) => async (contexto) => {
        const tipoCaja = await getTipoCaja(idTipoCaja);
        return pipeTipoCaja(contexto, [
            async (ctx) => ({ ...ctx, tipoCaja }),
            "ABIERTO",
        ]);
    };

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const idTipoCaja = payload as string;
    if (idTipoCaja) {
        return cargarTipoCaja(idTipoCaja)(contexto);
    }
    return { ...contexto, estado: "INICIAL", tipoCaja: tipoCajaInicial() };
};
