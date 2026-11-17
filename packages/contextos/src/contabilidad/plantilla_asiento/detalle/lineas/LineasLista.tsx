import { MetaTabla } from "@olula/componentes/atomos/qtabla.tsx";
import { ListadoSemiControlado } from "@olula/componentes/maestro/ListadoSemiControlado.tsx";
import { EmitirEvento } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { PartidaPlantilla } from "../../diseño.ts";
import { resumenConcepto, resumenImporte, resumenSubcuenta } from "../../dominio.ts";

const metaTablaPartidas: MetaTabla<PartidaPlantilla> = [
    { id: "numeroOrden", cabecera: "Nº" },
    { id: "codigoSubcuenta", cabecera: "Subcuenta", render: resumenSubcuenta },
    { id: "debeHaber", cabecera: "D/H" },
    { id: "importe", cabecera: "Importe", render: resumenImporte },
    { id: "concepto", cabecera: "Concepto", render: resumenConcepto },
];

export const LineasLista = ({
    partidas,
    seleccionada,
    publicar,
}: {
    partidas: PartidaPlantilla[];
    seleccionada?: string;
    publicar: EmitirEvento;
}) => (
    <ListadoSemiControlado
        metaTabla={metaTablaPartidas}
        entidades={partidas}
        totalEntidades={partidas.length}
        cargando={false}
        seleccionada={partidas.find((p) => p.id === seleccionada) ?? null}
        onSeleccion={(partida: PartidaPlantilla) => publicar("linea_seleccionada", partida)}
        criteriaInicial={criteriaDefecto}
        onCriteriaChanged={() => null}
        modo="tabla"
    />
);
