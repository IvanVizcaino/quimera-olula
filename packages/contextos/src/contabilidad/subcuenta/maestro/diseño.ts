import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Subcuenta } from "../diseño.ts";

export type EstadoMaestroSubcuenta = "INICIAL" | "CREANDO";

export type ContextoMaestroSubcuenta = {
    estado: EstadoMaestroSubcuenta;
    ejercicioId: string;
    subcuentas: ListaActivaEntidades<Subcuenta>;
};

export const ordenDefectoSubcuenta = ["codigo", "ASC"];

export const metaTablaSubcuenta: MetaTabla<Subcuenta> = [
    { id: "codigo", cabecera: "Código" },
    { id: "nombre", cabecera: "Descripción" },
    { id: "codigoCuenta", cabecera: "Cuenta" },
    { id: "ejercicioId", cabecera: "Ejercicio" },
];
