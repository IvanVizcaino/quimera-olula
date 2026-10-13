import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { LineaAlbaran } from "../../diseño.ts";
import { decimalesPrecioCompra } from "../../../comun/dominio.ts";
import { etiquetaLinea } from "../../dominio.ts";

const porcentaje = (valor: number | null | undefined) => (valor ? `${valor}%` : "");

export const metaTablaLineaAlbaran = (divisa?: string): MetaTabla<LineaAlbaran> => [
    {
        id: "descripcion",
        cabecera: "Línea",
        prioridad: "alta",
        render: etiquetaLinea,
    },
    { id: "cantidad", cabecera: "Cantidad", tipo: "numero", prioridad: "alta" },
    {
        id: "pvpUnitario",
        cabecera: "Coste",
        tipo: "moneda",
        divisa,
        decimales: decimalesPrecioCompra(),
        prioridad: "alta",
    },
    {
        id: "dtoPorcentual",
        cabecera: "% Dto.",
        prioridad: "media",
        render: (linea: LineaAlbaran) => porcentaje(linea.dtoPorcentual),
    },
    {
        id: "dtoLineal",
        cabecera: "Dto. lineal",
        tipo: "moneda",
        divisa,
        prioridad: "baja",
    },
    { id: "grupoIvaProductoId", cabecera: "IVA", prioridad: "media" },
    {
        id: "tipoIrpf",
        cabecera: "% I.R.P.F.",
        prioridad: "baja",
        render: (linea: LineaAlbaran) => porcentaje(linea.tipoIrpf),
    },
    {
        id: "pvpTotal",
        cabecera: "Total",
        tipo: "moneda",
        divisa,
        decimales: decimalesPrecioCompra(),
        prioridad: "alta",
    },
];
