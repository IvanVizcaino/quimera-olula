import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Cuenta } from "../diseño.ts";

export type EstadoMaestroCuenta = "INICIAL" | "CREANDO";

export type ContextoMaestroCuenta = {
    estado: EstadoMaestroCuenta;
    ejercicioId: string;
    cuentas: ListaActivaEntidades<Cuenta>;
};

export const ordenDefectoCuenta = ["codigo", "ASC"];

export const metaTablaCuenta: MetaTabla<Cuenta> = [
    { id: "codigo", cabecera: "Código" },
    { id: "nombre", cabecera: "Descripción" },
    { id: "codigoEpigrafe", cabecera: "Epígrafe" },
    { id: "ejercicioId", cabecera: "Ejercicio" },
];
