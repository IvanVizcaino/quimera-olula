import { Maquina } from "@olula/lib/diseño.js";
import { ContextoCuentasBanco, EstadoCuentasBanco } from "./diseño.ts";
import {
    cuentaActualizada,
    cuentaCreada,
    Cuentas,
    desmarcarDomiciliacionProceso,
    domiciliarCuentaProceso,
    recargarCuentas,
    remesaElegidaProceso,
} from "./dominio.ts";

export const getMaquina: () => Maquina<EstadoCuentasBanco, ContextoCuentasBanco> = () => {

    return {

        lista: {
            cargar_cuentas: recargarCuentas,

            alta_solicitada: "alta",

            edicion_solicitada: "edicion",

            cuenta_seleccionada: Cuentas.activar,

            borrado_solicitado: "confirmar_borrado",

            domiciliar_solicitada: domiciliarCuentaProceso,

            desmarcar_domiciliacion: desmarcarDomiciliacionProceso,

            seleccionar_remesa_solicitada: "remesa",
        },

        remesa: {
            remesa_elegida: remesaElegidaProceso,

            remesa_cancelada: "lista",
        },

        alta: {
            cuenta_creada: cuentaCreada,

            alta_cancelada: "lista",
        },

        edicion: {
            cuenta_actualizada: cuentaActualizada,

            edicion_cancelada: "lista",
        },

        confirmar_borrado: {
            cuenta_borrada: [Cuentas.quitar, "lista"],

            borrado_cancelado: "lista",
        },
    }
}
