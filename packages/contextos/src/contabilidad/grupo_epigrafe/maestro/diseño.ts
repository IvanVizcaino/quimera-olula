import { MetaTabla } from "@olula/componentes/index.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { ejercicioActual } from "#/contabilidad/asiento/dominio.ts";
import { GrupoEpigrafe } from "../diseño.ts";

export type EstadoMaestroGrupoEpigrafe = 'INICIAL' | 'CREANDO';

export type ContextoMaestroGrupoEpigrafe = {
    estado: EstadoMaestroGrupoEpigrafe;
    grupos: ListaActivaEntidades<GrupoEpigrafe>;
};

export const metaTablaGrupoEpigrafe: MetaTabla<GrupoEpigrafe> = [
    { id: 'codigo', cabecera: 'Código' },
    { id: 'descripcion', cabecera: 'Descripción' },
    { id: 'ejercicioId', cabecera: 'Ejercicio' },
];

/** Filtro explícito: el metaFiltro por defecto usaría el `id` camelCase de la
 * columna como nombre de campo de API, y la API espera snake_case. */
export const metaFiltroGrupoEpigrafe: MetaFiltro = {
    ejercicioId: {
        id: "ejercicioId",
        campo: "ejercicio_id",
        label: "Ejercicio",
        filtro: (valor) => {
            if (!valor || valor === "") return null;
            return ["ejercicio_id", "eq", valor as string];
        },
    },
    codigo: {
        id: "codigo",
        campo: "codigo",
        label: "Código",
        filtro: (valor) => {
            if (!valor || valor === "") return null;
            return ["codigo", "~", valor as string];
        },
    },
    descripcion: {
        id: "descripcion",
        campo: "descripcion",
        label: "Descripción",
        filtro: (valor) => {
            if (!valor || valor === "") return null;
            return ["descripcion", "~", valor as string];
        },
    },
};

export const criteriaGruposEpigrafesDefecto = (): Criteria => ({
    ...criteriaDefecto,
    filtro: [["ejercicio_id", "eq", ejercicioActual()]],
    orden: ["codigo", "ASC"],
});
