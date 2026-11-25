import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { criteriaDefecto, formatearNumero } from "@olula/lib/dominio.ts";
import { LineaInventario } from "../../diseño.ts";

const diferencia = (linea: LineaInventario) => linea.cantidadFinal - linea.cantidadInicial;

const metaTablaLineas: MetaTabla<LineaInventario> = [
    { id: "articuloId", cabecera: "Referencia", estilo: "secundario" },
    { id: "descripcion", cabecera: "Descripción", esTitulo: true, render: (l) => l.descripcion ?? "" },
    { id: "cantidadFinal", cabecera: "Contado", tipo: "numero", estilo: "destacado" },
    { id: "cantidadInicial", cabecera: "Stock anterior", tipo: "numero", prioridad: "media" },
    {
        id: "diferencia",
        cabecera: "Diferencia",
        prioridad: "media",
        render: (l) => {
            const d = diferencia(l);
            return d > 0 ? `+${formatearNumero(d)}` : formatearNumero(d);
        },
    },
    { id: "motivo", cabecera: "Motivo", prioridad: "baja", render: (l) => l.motivo ?? "" },
];

/** Líneas del inventario en modo tabla: cada una regulariza un artículo. */
export const LineasLista = ({
    lineas,
    seleccionada,
    publicar,
}: {
    lineas: LineaInventario[];
    seleccionada?: string;
    publicar: EmitirEvento;
}) => (
    <ListadoSemiControlado
        metaTabla={metaTablaLineas}
        entidades={lineas}
        totalEntidades={lineas.length}
        cargando={false}
        seleccionada={lineas.find((l) => l.id === seleccionada) ?? null}
        onSeleccion={(linea: LineaInventario) => publicar("linea_seleccionada", linea)}
        criteriaInicial={criteriaDefecto}
        onCriteriaChanged={() => null}
        modo="tabla"
        mensajeSinDatos="El inventario no tiene líneas: añádalas a mano o cargue un fichero."
    />
);
