import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { TarjetaPuntos } from "../diseño.ts";

export type EstadoMaestroTarjetaPuntos = "INICIAL" | "CREANDO";

export type ContextoMaestroTarjetaPuntos = {
    estado: EstadoMaestroTarjetaPuntos;
    tarjetas: ListaActivaEntidades<TarjetaPuntos>;
};

export const metaTablaTarjetaPuntos: MetaTabla<TarjetaPuntos> = [
    { id: "id", cabecera: "Código" },
    { id: "nombre", cabecera: "Titular" },
    { id: "idFiscal", cabecera: "NIF" },
    { id: "ciudad", cabecera: "Ciudad" },
    { id: "saldo", cabecera: "Saldo", tipo: "numero" },
];
