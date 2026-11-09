import { MetaTabla } from "@olula/componentes/index.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { ComparativaVentas } from "../diseño.ts";

export type EstadoMaestroComparativaVentas = "INICIAL" | "CREANDO";

export type ContextoMaestroComparativaVentas = {
    estado: EstadoMaestroComparativaVentas;
    comparativas: ListaActivaEntidades<ComparativaVentas>;
};

export const metaTablaComparativaVentas: MetaTabla<ComparativaVentas> = [
    { id: "descripcion", cabecera: "Descripción" },
    { id: "anioDesde", cabecera: "Año desde", tipo: "numero" },
    { id: "anioHasta", cabecera: "Año hasta", tipo: "numero" },
    { id: "clienteId", cabecera: "Cliente" },
    { id: "agenteId", cabecera: "Agente" },
];

export const metaFiltroComparativaVentas: MetaFiltro = {
    descripcion: {
        id: "descripcion",
        campo: "descripcion",
        label: "Descripción",
        filtro: (valor) =>
            !valor || valor === "" ? null : ["descripcion", "~", valor as string],
    },
    anioDesde: {
        id: "anioDesde",
        campo: "anio_desde",
        label: "Año desde",
        filtro: (valor) =>
            !valor || valor === "" ? null : ["anio_desde", "eq", valor as string],
    },
};

export const criteriaComparativaVentasDefecto = (): Criteria => ({
    ...criteriaDefecto,
    orden: ["id", "DESC"],
});
