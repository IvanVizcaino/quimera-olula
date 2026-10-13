import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ItemAsiento } from "../../diseño.ts";

export const metaTablaAsiento: MetaTabla<ItemAsiento> = [
    { id: "numero", cabecera: "Nº" },
    { id: "fecha", cabecera: "Fecha", tipo: "fecha" },
    { id: "concepto", cabecera: "Concepto" },
    { id: "importe", cabecera: "Importe", tipo: "moneda" },
    {
        id: "manual",
        cabecera: "Manual",
        render: (a) => (a.manual ? "Sí" : "No"),
    },
];
