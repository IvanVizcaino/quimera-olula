import { Criteria, Entidad, RespuestaLista } from "@olula/lib/diseño.ts";

/**
 * Consultas que necesita un maestro sencillo de producción (lista en modo tabla y detalle a la
 * derecha). Las de cada maestro están en su `infraestructura.ts`.
 */
export type ConsultasMaestro<T extends Entidad> = {
    getUno: (id: string) => Promise<T>;
    getLista: (criteria: Criteria) => RespuestaLista<T>;
};
