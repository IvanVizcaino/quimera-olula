import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ItemInventario } from "../../diseño.ts";

export const metaTablaInventario: MetaTabla<ItemInventario> = [
    { id: "id", cabecera: "Código" },
    { id: "almacenId", cabecera: "Almacén" },
    { id: "fecha", cabecera: "Fecha", tipo: "fecha" },
    {
        id: "cerrado",
        cabecera: "Estado",
        render: (i) => (i.cerrado ? "Cerrado" : "Abierto"),
    },
    { id: "observaciones", cabecera: "Observaciones" },
];
