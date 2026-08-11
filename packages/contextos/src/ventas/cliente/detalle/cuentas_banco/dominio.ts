import { ProcesarContexto } from "@olula/lib/diseño.js";
import { ejecutarListaProcesos, MetaModelo } from "@olula/lib/dominio.js";
import { accionesListaEntidades, ProcesarListaEntidades } from "@olula/lib/ListaEntidades.js";
import { CuentaBanco, NuevaCuentaBanco } from "../../diseño.ts";
import {
    desmarcarCuentaDomiciliacion,
    domiciliarCuenta,
    getCuentasBanco,
} from "../../infraestructura.ts";
import { ContextoCuentasBanco, EstadoCuentasBanco } from "./diseño.ts";

export const metaCuentaBanco: MetaModelo<CuentaBanco> = {
    campos: {
        iban: { requerido: true },
    }
};

export const metaNuevaCuentaBanco: MetaModelo<NuevaCuentaBanco> = {
    campos: {
        cuenta: { requerido: true },
    }
};

export const nuevaCuentaBancoVacia: NuevaCuentaBanco = {
    descripcion: '',
    iban: '',
}

export const metaTablaCuentasBanco = [
    { id: "descripcion", cabecera: "Descripcion" },
    { id: "iban", cabecera: "IBAN" },
    { id: "bic", cabecera: "BIC" },
];

type ProcesarCuentasBanco = ProcesarContexto<EstadoCuentasBanco, ContextoCuentasBanco>;

const conCuentas = (fn: ProcesarListaEntidades<CuentaBanco>) =>
    (ctx: ContextoCuentasBanco) => ({ ...ctx, cuentas: fn(ctx.cuentas) });

export const Cuentas = accionesListaEntidades(conCuentas);

export const recargarCuentas: ProcesarCuentasBanco = async (contexto, payload) => {
    const clienteId = (payload as string) || contexto.clienteId;
    const resultado = await getCuentasBanco(clienteId);
    const contextoActualizado = await Cuentas.recargar(contexto, { datos: resultado, total: resultado.length });
    return {
        ...contextoActualizado,
        clienteId,
        cargando: false,
    }
}

const pipeCuentas = ejecutarListaProcesos<EstadoCuentasBanco, ContextoCuentasBanco>;

// Recarga usando contexto.clienteId (sin propagar el payload del evento, que trae
// el id de la cuenta y no el del cliente). Espeja el patrón de direcciones.
export const cuentaCreada: ProcesarCuentasBanco = async (contexto) => {
    return pipeCuentas(contexto, [recargarCuentas, "lista"]);
}

export const cuentaActualizada: ProcesarCuentasBanco = async (contexto) => {
    return pipeCuentas(contexto, [recargarCuentas, "lista"]);
}

export const remesaElegidaProceso: ProcesarCuentasBanco = async (contexto, payload) => {
    const { cuenta_id, descripcion } = payload as { cuenta_id: string; descripcion: string };
    return [
        { ...contexto, estado: "lista" },
        [["cuenta_remesa_seleccionada", { cuenta_id, descripcion }]],
    ];
}

export const domiciliarCuentaProceso: ProcesarCuentasBanco = async (contexto) => {
    if (!contexto.cuentas.activo?.id) return contexto;

    await domiciliarCuenta(contexto.clienteId, contexto.cuentas.activo.id);

    return [
        contexto,
        [["cuenta_domiciliada", {
            cuenta_id: contexto.cuentas.activo.id,
            descripcion: contexto.cuentas.activo.descripcion,
        }]]
    ];
}

export const desmarcarDomiciliacionProceso: ProcesarCuentasBanco = async (contexto) => {
    await desmarcarCuentaDomiciliacion(contexto.clienteId);

    return [
        contexto,
        [["cuenta_domiciliacion_desmarcada"]]
    ];
}
