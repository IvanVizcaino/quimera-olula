import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.ts";
import { pluginActivo } from "@olula/lib/plugins.tsx";
import { useMemo } from "react";
import { diferenciaLineaInventario } from "../../../dominio.ts";
import { LineaInventario } from "../../../diseño.ts";

const metaTablaLineasBase: MetaTabla<LineaInventario> = [
    { id: "referencia", cabecera: "Referencia" },
    { id: "descripcion", cabecera: "Descripción" },
    { id: "cantidadIni", cabecera: "Stock" },
    { id: "cantidadFin", cabecera: "Recuento" },
    {
        id: "diferencia",
        cabecera: "Diferencia",
        render: (l) => diferenciaLineaInventario(l),
    },
];

export const LineasInventarioLista = ({
    lineas,
    seleccionada,
    publicar,
}: {
    lineas: LineaInventario[];
    seleccionada?: string;
    publicar: EmitirEvento;
}) => {
    const metaTablaLineas = useMemo(() => {
        if (!pluginActivo("trazabilidad")) {
            return metaTablaLineasBase;
        }
        return [
            ...metaTablaLineasBase.slice(0, 2),
            {
                id: "codlote" as const,
                cabecera: "Lote",
                render: (l: LineaInventario) => l.codlote ?? "—",
            },
            ...metaTablaLineasBase.slice(2),
        ];
    }, []);

    return (
    <ListadoSemiControlado
        metaTabla={metaTablaLineas}
        entidades={lineas}
        totalEntidades={lineas.length}
        cargando={false}
        seleccionada={lineas.find((l) => l.id === seleccionada) ?? null}
        onSeleccion={(linea) => publicar("linea_seleccionada", linea)}
        criteriaInicial={criteriaDefecto}
        onCriteriaChanged={() => null}
        modo="tabla"
    />
    );
};
