import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { PartidaSubcuenta, SubcuentaTercero } from "../diseño.ts";

/** Columnas de co_subcuentascli / co_subcuentasprov en Eneboo. */
export const metaTablaSubcuentasTercero: MetaTabla<SubcuentaTercero> = [
    { id: "ejercicioId", cabecera: "Ejercicio" },
    { id: "codigoSubcuenta", cabecera: "Subcuenta" },
    { id: "saldo", cabecera: "Saldo", tipo: "moneda" },
];

/** Columnas de co_partidasmayor en Eneboo. */
export const metaTablaPartidasSubcuenta: MetaTabla<PartidaSubcuenta> = [
    { id: "fecha", cabecera: "Fecha", tipo: "fecha" },
    { id: "numeroAsiento", cabecera: "Asiento", tipo: "numero" },
    { id: "concepto", cabecera: "Concepto" },
    { id: "debe", cabecera: "Debe", tipo: "moneda" },
    { id: "haber", cabecera: "Haber", tipo: "moneda" },
    { id: "saldo", cabecera: "Saldo", tipo: "moneda" },
];
