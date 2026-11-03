import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ItemAsiento } from "../../diseño.ts";

// Con el maestro contraído al 30% solo caben las columnas de prioridad alta.
export const metaTablaAsiento: MetaTabla<ItemAsiento> = [
    { id: "numero", cabecera: "Nº", prioridad: "alta" },
    { id: "fecha", cabecera: "Fecha", tipo: "fecha", prioridad: "alta" },
    { id: "concepto", cabecera: "Concepto", prioridad: "baja" },
    { id: "importe", cabecera: "Importe", tipo: "moneda", prioridad: "alta" },
    {
        id: "manual",
        cabecera: "Manual",
        prioridad: "baja",
        render: (a) => (a.manual ? "Sí" : "No"),
    },
];
