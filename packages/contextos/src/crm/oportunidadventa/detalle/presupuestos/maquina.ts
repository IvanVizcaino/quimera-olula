import { Maquina } from "@olula/lib/diseño.js";
import { ContextoPresupuestosOportunidad, EstadoPresupuestosOportunidad } from "./diseño.ts";
import { Presupuestos, recargarPresupuestos } from "./presupuestos.ts";

export const getMaquina: () => Maquina<EstadoPresupuestosOportunidad, ContextoPresupuestosOportunidad> = () => {
    return {
        INICIAL: {
            presupuesto_seleccionado: [Presupuestos.activar],

            recarga_de_presupuestos_solicitada: [recargarPresupuestos],

            borrado_presupuesto_solicitado: "BORRANDO",

            presupuesto_creado: [Presupuestos.incluir, Presupuestos.activar],
        },
        BORRANDO: {
            borrado_presupuesto_cancelado: "INICIAL",

            presupuesto_borrado: [Presupuestos.quitar, "INICIAL"],
        }
    }
}
