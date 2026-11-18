import { MetaTabla } from "@olula/componentes/index.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { LibroMayor } from "../diseño.ts";

export type EstadoMaestroLibroMayor = "INICIAL" | "CREANDO";

export type ContextoMaestroLibroMayor = {
    estado: EstadoMaestroLibroMayor;
    informes: ListaActivaEntidades<LibroMayor>;
};

export const metaTablaLibroMayor: MetaTabla<LibroMayor> = [
    { id: "descripcion", cabecera: "Descripción" },
    { id: "ejercicioId", cabecera: "Ejercicio" },
    { id: "fechaDesde", cabecera: "Desde" },
    { id: "fechaHasta", cabecera: "Hasta" },
];

/** Filtro explícito: el metaFiltro por defecto usaría el `id` camelCase de la
 * columna como nombre de campo de API, y la API espera snake_case. */
export const metaFiltroLibroMayor: MetaFiltro = {
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

export const criteriaLibroMayorDefecto = (): Criteria => ({
    ...criteriaDefecto,
    orden: ["id", "DESC"],
});
