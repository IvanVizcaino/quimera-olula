import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { PartidaCompra } from "../diseño.ts";

export const metaTablaPartidasCompra: MetaTabla<PartidaCompra> = [
    { id: "fecha", cabecera: "Fecha", tipo: "fecha" },
    { id: "codigoFactura", cabecera: "Factura" },
    { id: "nombreProveedor", cabecera: "Proveedor" },
    { id: "codigoSubcuenta", cabecera: "Subcuenta" },
    { id: "concepto", cabecera: "Concepto" },
    { id: "debe", cabecera: "Debe", tipo: "moneda" },
];
