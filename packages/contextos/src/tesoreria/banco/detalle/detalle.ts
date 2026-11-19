import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { ejecutarListaProcesos } from "@olula/lib/dominio.ts";
import { Banco, CambiosBanco, Sucursal } from "../diseño.ts";
import { bancoVacio } from "../dominio.ts";
import { getBanco, patchBanco } from "../infraestructura.ts";
import { ContextoDetalleBanco, EstadoDetalleBanco } from "./diseño.ts";

type ProcesarDetalle = ProcesarContexto<EstadoDetalleBanco, ContextoDetalleBanco>;

const pipeBanco = ejecutarListaProcesos<EstadoDetalleBanco, ContextoDetalleBanco>;

const CAMPOS_EDITABLES = ["nombre", "proveedorId", "bicDefecto"] as const;

export const contextoDetalleBancoInicial: ContextoDetalleBanco = {
    estado: "INICIAL",
    banco: bancoVacio(),
    sucursalActiva: null,
};

export const cambiosBanco = (previo: Banco, actual: Banco): CambiosBanco => {
    const cambios: CambiosBanco = {};
    for (const campo of CAMPOS_EDITABLES) {
        if (actual[campo] !== previo[campo]) cambios[campo] = actual[campo];
    }
    return cambios;
};

export const guardarBanco = async (contexto: ContextoDetalleBanco, banco: Banco): Promise<void> => {
    const cambios = cambiosBanco(contexto.banco, banco);
    if (Object.keys(cambios).length > 0) {
        await patchBanco(banco.id, cambios);
    }
};

export const refrescarBanco: ProcesarDetalle = async (contexto) => {
    const banco = await getBanco(contexto.banco.id);
    return [
        { ...contexto, estado: "ABIERTO", banco, sucursalActiva: null },
        [["banco_cambiado", banco]],
    ];
};

export const activarSucursal: (estado: EstadoDetalleBanco) => ProcesarDetalle =
    (estado) => async (contexto, payload) => ({
        ...contexto,
        estado,
        sucursalActiva: payload as Sucursal,
    });

export const cargarBanco: (_: string) => ProcesarDetalle = (id) => async (contexto) => {
    const banco = await getBanco(id);
    return pipeBanco(contexto, [async (ctx) => ({ ...ctx, banco, sucursalActiva: null }), "ABIERTO"]);
};

export const cargarContexto: ProcesarDetalle = async (contexto, payload) => {
    const id = payload as string;
    if (id) {
        return cargarBanco(id)(contexto);
    }
    return { ...contexto, estado: "INICIAL", banco: bancoVacio(), sucursalActiva: null };
};
