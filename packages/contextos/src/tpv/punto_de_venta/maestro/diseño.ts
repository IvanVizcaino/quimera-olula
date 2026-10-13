import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { PuntoVentaTpv } from "../diseño.ts";

export type EstadoMaestroPuntoVentaTpv = "INICIAL" | "CREANDO";

export type ContextoMaestroPuntoVentaTpv = {
    estado: EstadoMaestroPuntoVentaTpv;
    puntos: ListaActivaEntidades<PuntoVentaTpv>;
};

export const metaTablaPuntoVentaTpv: MetaTabla<PuntoVentaTpv> = [
    { id: "id", cabecera: "Código" },
    { id: "nombre", cabecera: "Nombre" },
    { id: "serieId", cabecera: "Serie" },
    { id: "tiendaId", cabecera: "Tienda" },
    { id: "agenteId", cabecera: "Agente" },
];
