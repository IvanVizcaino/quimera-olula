import { Modelo } from "@olula/lib/diseño.ts";
import type { Catalogo, Periodicidad } from "../saas_suscripcion/diseño.ts";

/** Alta pública de una empresa en Olula SaaS. */
export interface NuevoRegistro extends Modelo {
    nombreEmpresa: string;
    nif: string;
    nombre: string;
    email: string;
    contraseña: string;
    repetirContraseña: string;
}

export type EstadoEmpresaRegistrada =
    | "pendiente_verificacion" | "provisionando" | "activo" | "suspendido" | "baja" | "error";

export interface ResultadoRegistro {
    empresa: string;
    email: string;
}

export interface EstadoRegistro {
    empresa: string;
    estado: EstadoEmpresaRegistrada;
    email?: string;
}

/** Plan y periodicidad elegidos en el registro; sin ellos el backend usa Pro con su prueba. */
export interface SeleccionPlanRegistro {
    planId: string;
    periodicidad: Periodicidad;
}

export type PostRegistro = (
    registro: NuevoRegistro, captcha: string | null, plan?: SeleccionPlanRegistro | null,
) => Promise<ResultadoRegistro>;
export type GetPlanesPublicos = () => Promise<Catalogo>;
export type PostVerificar = (token: string) => Promise<EstadoRegistro>;
export type GetEstadoRegistro = (token: string) => Promise<EstadoRegistro>;
