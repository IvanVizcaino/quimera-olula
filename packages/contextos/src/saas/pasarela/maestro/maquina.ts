import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroPasarela, EstadoMaestroPasarela } from "./diseño.js";
import * as maestro from "./maestro.js";

export const getMaquina: () => Maquina<EstadoMaestroPasarela, ContextoMaestroPasarela> = () => {
    return {
        INICIAL: {
            recarga_de_pasarelas_solicitada: maestro.recargarPasarelas,

            guardar_solicitado: maestro.guardarPasarela,
            probar_solicitado: maestro.probarConexion,
            sincronizar_solicitado: maestro.sincronizarCatalogo,

            ciclo_solicitado: "CONFIRMANDO_CICLO",
        },

        CONFIRMANDO_CICLO: {
            ciclo_confirmado: maestro.pasarCiclo,
            ciclo_cancelado: "INICIAL",
        },
    };
};
