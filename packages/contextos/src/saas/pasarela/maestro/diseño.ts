import { CredencialExterna } from "../../../comun/credencial_externa/diseño.js";
import { Pasarela, ResumenCiclo } from "../diseño.js";

export type EstadoMaestroPasarela = 'INICIAL' | 'CONFIRMANDO_CICLO';

export type ContextoMaestroPasarela = {
    estado: EstadoMaestroPasarela;
    pasarelas: Pasarela[];
    credenciales: CredencialExterna[];
    /** Último mensaje por pasarela (p. ej. precios creados al sincronizar). */
    mensajes: Record<string, string>;
    resumenCiclo: ResumenCiclo | null;
};
