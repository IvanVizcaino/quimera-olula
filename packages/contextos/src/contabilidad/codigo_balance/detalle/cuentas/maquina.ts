import { Maquina } from "@olula/lib/diseño.ts";
import { recargarCuentas, seleccionarCuenta } from "./cuentas.ts";
import { ContextoCuentasCodigoBalance, EstadoCuentasCodigoBalance } from "./diseño.ts";

export const getMaquina: () => Maquina<EstadoCuentasCodigoBalance, ContextoCuentasCodigoBalance> = () => ({
    INICIAL: {
        recarga_de_cuentas_solicitada: recargarCuentas,
        cuenta_seleccionada: seleccionarCuenta,
        alta_cuenta_solicitada: "CREANDO",
        cambio_cuenta_solicitado: "CAMBIANDO",
        baja_cuenta_solicitada: "BORRANDO",
    },
    CREANDO: {
        cuenta_creada: recargarCuentas,
        alta_de_cuenta_cancelada: "INICIAL",
    },
    CAMBIANDO: {
        cuenta_cambiada: recargarCuentas,
        cambio_de_cuenta_cancelado: "INICIAL",
    },
    BORRANDO: {
        cuenta_borrada: recargarCuentas,
        borrado_de_cuenta_cancelado: "INICIAL",
    },
});
