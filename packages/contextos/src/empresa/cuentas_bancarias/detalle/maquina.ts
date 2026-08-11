import { Maquina } from "@olula/lib/diseño.ts";
import { publicar } from "@olula/lib/dominio.ts";
import { CuentaBancaria } from "../diseño.js";
import { cargarContexto, refrescarCuenta } from "./detalle.js";

export type EstadoDetalleCuentaBancaria =
    | 'INICIAL'
    | 'ABIERTO'
    | 'BORRANDO';

export type ContextoDetalleCuentaBancaria = {
    estado: EstadoDetalleCuentaBancaria;
    cuenta: CuentaBancaria;
};

export const getMaquina: () => Maquina<EstadoDetalleCuentaBancaria, ContextoDetalleCuentaBancaria> = () => {
    return {
        INICIAL: {
            cuenta_id_cambiado: [cargarContexto],

            cuenta_deseleccionada: [
                publicar('cuenta_deseleccionada', null),
            ],
        },

        ABIERTO: {
            cuenta_guardada: [refrescarCuenta],

            borrado_solicitado: "BORRANDO",

            cuenta_id_cambiado: [cargarContexto],
        },

        BORRANDO: {
            cuenta_borrada: [
                publicar('cuenta_borrada', null),
                "INICIAL",
            ],

            borrado_cancelado: "ABIERTO",
        },
    };
};
