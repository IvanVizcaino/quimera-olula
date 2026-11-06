import { MetaTabla } from "@olula/componentes/index.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { LibroFacturasRecibidas } from "../diseño.ts";

export type EstadoMaestroLibroFacturasRecibidas = "INICIAL" | "CREANDO";

export type ContextoMaestroLibroFacturasRecibidas = {
    estado: EstadoMaestroLibroFacturasRecibidas;
    informes: ListaActivaEntidades<LibroFacturasRecibidas>;
};

export const metaTablaLibroFacturasRecibidas: MetaTabla<LibroFacturasRecibidas> =
    [
        { id: "descripcion", cabecera: "Descripción" },
        { id: "ejercicioId", cabecera: "Ejercicio" },
        { id: "fechaDesde", cabecera: "Desde" },
        { id: "fechaHasta", cabecera: "Hasta" },
    ];

/** Filtro explícito: el metaFiltro por defecto usaría el `id` camelCase de la
 * columna como nombre de campo de API, y la API espera snake_case. */
export const metaFiltroLibroFacturasRecibidas: MetaFiltro = {
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

export const criteriaLibroFacturasRecibidasDefecto = (): Criteria => ({
    ...criteriaDefecto,
    orden: ["id", "DESC"],
});
