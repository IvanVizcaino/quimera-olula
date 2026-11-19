import { AccesoSoporte, Tenant, UsuarioSoporte } from "../diseño.js";
import { DatosSuscripcion, ExcepcionLimite } from "../suscripcion/diseño.js";

export type EstadoDetalleTenant =
    | 'INICIAL'
    | 'ABIERTO'
    | 'DANDO_DE_BAJA'
    | 'ELIMINANDO_BD'
    | 'CAMBIANDO_CONTRASENA'
    | 'CAMBIANDO_PLAN'
    | 'EDITANDO_EXCEPCION'
    | 'QUITANDO_EXCEPCION';

export type ContextoDetalleTenant = {
    estado: EstadoDetalleTenant;
    tenant: Tenant;
    usuarios: UsuarioSoporte[];
    grupos: string[];
    accesos: AccesoSoporte[];
    usuarioContrasena: UsuarioSoporte | null;
    /** Datos de la pestaña Suscripción; null si no se han podido cargar (ver suscripcionError). */
    suscripcion: DatosSuscripcion | null;
    suscripcionError: string;
    /** Excepción sobre la que actúan los modales; null en el alta. */
    excepcion: ExcepcionLimite | null;
};
