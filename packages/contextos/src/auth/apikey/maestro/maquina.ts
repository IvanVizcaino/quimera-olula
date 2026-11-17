import { Maquina } from "@olula/lib/diseño.ts";
import { ContextoMaestroApiKey, EstadoMaestroApiKey } from "./diseño.ts";
import * as maestro from "./maestro.ts";

export const getMaquina: () => Maquina<EstadoMaestroApiKey, ContextoMaestroApiKey> = () => ({
    INICIAL: {
        recarga_de_claves_solicitada: maestro.recargarClaves,
        crear_clave_solicitado: "CREANDO",
        revocar_clave_solicitado: maestro.pedirRevocar,
    },
    CREANDO: {
        alta_cancelada: "INICIAL",
        clave_creada: maestro.enseñarClaveNueva,
    },
    CREADA: {
        clave_nueva_cerrada: maestro.olvidarClaveNueva,
    },
    REVOCANDO: {
        revocacion_cancelada: maestro.cancelarRevocar,
        clave_revocada: maestro.quitarRevocada,
    },
});
