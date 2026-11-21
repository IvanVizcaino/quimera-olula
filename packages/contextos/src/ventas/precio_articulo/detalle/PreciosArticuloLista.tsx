import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { criteriaDefecto, formatearMoneda } from "@olula/lib/dominio.js";
import { PrecioArticulo } from "../diseño.ts";
import { pvpIgnorado, textoTramo } from "../dominio.ts";

// Con anchos fijos la descripción ocupa el resto y se recorta con "…": sin
// ellos una descripción larga empuja las columnas de importes fuera de la vista.
// QTablaControlada pinta tal cual lo que devuelve `render`, así que los importes
// se formatean aquí; `tipo` solo sirve para alinearlos a la derecha.
const metaTabla: MetaTabla<PrecioArticulo> = [
    { id: "articuloId", cabecera: "Referencia", estilo: "secundario", ancho: "7rem" },
    { id: "descripcionArticulo", cabecera: "Descripción", esTitulo: true },
    { id: "tramo", cabecera: "Cantidad", render: textoTramo, ancho: "8rem" },
    {
        id: "dtoPorcentual",
        cabecera: "% Dto.",
        tipo: "numero",
        ancho: "5rem",
        render: (p) => (p.dtoPorcentual ? `${p.dtoPorcentual.toLocaleString("es-ES")} %` : ""),
    },
    {
        id: "pvp",
        cabecera: "Precio neto",
        tipo: "moneda",
        divisa: "EUR",
        ancho: "7rem",
        // Con descuento el pvp de la fila no se usa: no se enseña.
        render: (p) => (pvpIgnorado(p) || !p.pvp ? "" : formatearMoneda(p.pvp, "EUR")),
    },
];

export const PreciosArticuloLista = ({
    precios,
    seleccionado,
    publicar,
}: {
    precios: PrecioArticulo[];
    seleccionado?: string;
    publicar: EmitirEvento;
}) => (
    <ListadoSemiControlado
        metaTabla={metaTabla}
        entidades={precios}
        totalEntidades={precios.length}
        cargando={false}
        seleccionada={precios.find((p) => p.id === seleccionado) ?? null}
        onSeleccion={(precio: PrecioArticulo) => publicar("precio_seleccionado", precio)}
        criteriaInicial={criteriaDefecto}
        onCriteriaChanged={() => null}
        modo="tabla"
    />
);
