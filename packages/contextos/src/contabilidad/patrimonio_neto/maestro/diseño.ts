import { MetaTabla } from "@olula/componentes/index.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { PatrimonioNeto } from "../diseño.ts";

export type EstadoMaestroPatrimonioNeto = "INICIAL" | "CREANDO";

export type ContextoMaestroPatrimonioNeto = {
    estado: EstadoMaestroPatrimonioNeto;
    informes: ListaActivaEntidades<PatrimonioNeto>;
};

export const metaTablaPatrimonioNeto: MetaTabla<PatrimonioNeto> = [
    { id: "descripcion", cabecera: "Descripción" },
    { id: "ejercicioId", cabecera: "Ejercicio actual" },
    { id: "ejercicioAnteriorId", cabecera: "Ejercicio X-1" },
    { id: "ejercicioAnteriorAnteriorId", cabecera: "Ejercicio X-2" },
];

/** Filtro explícito: la API espera los nombres en snake_case. */
export const metaFiltroPatrimonioNeto: MetaFiltro = {
    descripcion: {
        id: "descripcion",
        campo: "descripcion",
        label: "Descripción",
        filtro: (valor) =>
            !valor || valor === ""
                ? null
                : ["descripcion", "~", valor as string],
    },
    ejercicioId: {
        id: "ejercicioId",
        campo: "ejercicio_id",
        label: "Ejercicio",
        filtro: (valor) =>
            !valor || valor === ""
                ? null
                : ["ejercicio_id", "eq", valor as string],
    },
};

export const criteriaPatrimonioNetoDefecto = (): Criteria => ({
    ...criteriaDefecto,
    orden: ["id", "DESC"],
});
