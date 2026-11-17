import { CuentaCodigoBalance, FormatoBalance } from "../../diseño.ts";

export type EstadoCuentasCodigoBalance = "INICIAL" | "CREANDO" | "CAMBIANDO" | "BORRANDO";

export type ContextoCuentasCodigoBalance = {
    estado: EstadoCuentasCodigoBalance;
    formato: FormatoBalance;
    codigoBalanceId: string;
    cuentas: CuentaCodigoBalance[];
    activa: CuentaCodigoBalance | null;
};
