import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroCuenta, EstadoMaestroCuenta } from "./diseño.ts";
import { Cuentas, recargarCuentas, cambiarEjercicio } from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoMaestroCuenta, ContextoMaestroCuenta> = () => ({
    INICIAL: {
        cuenta_cambiada: Cuentas.cambiar,
        cuenta_seleccionada: [Cuentas.activar],
        seleccion_cancelada: Cuentas.desactivar,
        cuenta_creada: Cuentas.incluir,
        cuenta_borrada: Cuentas.quitar,
        recarga_solicitada: recargarCuentas,
        criteria_cambiado: [Cuentas.filtrar, recargarCuentas],
        ejercicio_cambiado: cambiarEjercicio,
        crear: "CREANDO",
    },
    CREANDO: {
        cuenta_creada: [Cuentas.incluir, "INICIAL"],
        creacion_cancelada: "INICIAL",
    },
});
