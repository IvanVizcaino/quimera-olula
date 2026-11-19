import { puede } from "@olula/lib/dominio.ts";
import { configurarAccionErrorLimite } from "@olula/lib/errores_limite.ts";
import { accionErrorSuscripcion, REGLA_SUSCRIPCION } from "./dominio.ts";

/**
 * Registra qué se ofrece junto a los errores de límites del plan (409 `[limite:...]`,
 * 402 `[solo_lectura]`, 403 `[modulo:...]`): ver mi suscripción o, si el usuario no tiene
 * permiso, pedirlo a su administrador. Lo llama la app olula_saas al arrancar.
 */
export const registrarAccionesErrorSuscripcion = () =>
    configurarAccionErrorLimite((error) => accionErrorSuscripcion(error, puede(REGLA_SUSCRIPCION)));
