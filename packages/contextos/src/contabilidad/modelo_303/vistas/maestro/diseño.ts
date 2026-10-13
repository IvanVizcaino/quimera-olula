import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { etiquetaPeriodoModelo303 } from "../../dominio.ts";
import { ItemModelo303 } from "../../diseño.ts";

export const metaTablaModelo303: MetaTabla<ItemModelo303> = [
    { id: "modeloId", cabecera: "Id" },
    { id: "codejercicio", cabecera: "Ejercicio" },
    {
        id: "trimestre",
        cabecera: "Periodo",
        render: (m) => etiquetaPeriodoModelo303(m),
    },
    {
        id: "fechaInicio",
        cabecera: "Desde",
    },
    {
        id: "fechaFin",
        cabecera: "Hasta",
    },
    { id: "resliquid", cabecera: "Resultado liquidación", tipo: "moneda" },
    { id: "cuotaresultado", cabecera: "Cuota resultado", tipo: "moneda" },
];
