import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { criteriaDefecto, formatearMoneda } from "@olula/lib/dominio.js";
import { PrecioArticulo } from "../diseño.ts";
import { pvpIgnorado, textoTramo } from "../dominio.ts";

const metaTabla: MetaTabla<PrecioArticulo> = [
    { id: "articuloId", cabecera: "Referencia", estilo: "secundario" },
    { id: "descripcionArticulo", cabecera: "Descripción", esTitulo: true },
    { id: "tramo", cabecera: "Cantidad", render: textoTramo },
    {
        id: "dtoPorcentual",
        cabecera: "% Dto.",
        render: (p) => (p.dtoPorcentual ? `${p.dtoPorcentual.toLocaleString("es-ES")} %` : ""),
    },
    {
        id: "pvp",
        cabecera: "Precio neto",
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
