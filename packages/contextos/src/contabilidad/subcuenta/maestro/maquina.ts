import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroSubcuenta, EstadoMaestroSubcuenta } from "./diseño.ts";
import { Subcuentas, recargarSubcuentas, cambiarEjercicio } from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoMaestroSubcuenta, ContextoMaestroSubcuenta> = () => ({
    INICIAL: {
        subcuenta_cambiada: Subcuentas.cambiar,
        subcuenta_seleccionada: [Subcuentas.activar],
        seleccion_cancelada: Subcuentas.desactivar,
        subcuenta_creada: Subcuentas.incluir,
        subcuenta_borrada: Subcuentas.quitar,
        recarga_solicitada: recargarSubcuentas,
        criteria_cambiado: [Subcuentas.filtrar, recargarSubcuentas],
        ejercicio_cambiado: cambiarEjercicio,
        crear: "CREANDO",
    },
    CREANDO: {
        subcuenta_creada: [Subcuentas.incluir, "INICIAL"],
        creacion_cancelada: "INICIAL",
    },
});
