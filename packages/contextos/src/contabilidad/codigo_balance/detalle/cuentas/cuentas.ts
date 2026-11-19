import { ProcesarContexto } from "@olula/lib/diseño.ts";
import { CuentaCodigoBalance } from "../../diseño.ts";
import { getCuentasCodigoBalance } from "../../infraestructura.ts";
import { ContextoCuentasCodigoBalance, EstadoCuentasCodigoBalance } from "./diseño.ts";

type ProcesarCuentas = ProcesarContexto<EstadoCuentasCodigoBalance, ContextoCuentasCodigoBalance>;

/** Recarga la tabla del sub-recurso y vuelve a INICIAL conservando la
 * selección si la cuenta sigue existiendo. */
export const recargarCuentas: ProcesarCuentas = async (contexto) => {
    const { datos } = await getCuentasCodigoBalance(contexto.formato, contexto.codigoBalanceId);
    const activa = datos.find((c) => c.id === contexto.activa?.id) ?? null;
    return { ...contexto, estado: "INICIAL", cuentas: datos, activa };
};

export const seleccionarCuenta: ProcesarCuentas = async (contexto, payload) => ({
    ...contexto,
    activa: payload as CuentaCodigoBalance,
});
