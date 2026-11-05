import { MetaTabla } from "@olula/componentes/index.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { CuentasAnuales } from "../diseño.ts";

export type EstadoMaestroCuentasAnuales = "INICIAL" | "CREANDO";

export type ContextoMaestroCuentasAnuales = {
    estado: EstadoMaestroCuentasAnuales;
    informes: ListaActivaEntidades<CuentasAnuales>;
};

export const metaTablaCuentasAnuales: MetaTabla<CuentasAnuales> = [
    { id: "descripcion", cabecera: "Descripción" },
    { id: "tipo", cabecera: "Tipo" },
    { id: "formato", cabecera: "Formato" },
    { id: "nivelDesglose", cabecera: "Desglose" },
];

/** Filtro explícito: el metaFiltro por defecto usaría el `id` camelCase de la
 * columna como nombre de campo de API, y la API espera snake_case. */
export const metaFiltroCuentasAnuales: MetaFiltro = {
    descripcion: {
        id: "descripcion",
        campo: "descripcion",
        label: "Descripción",
        filtro: (valor) =>
            !valor || valor === ""
                ? null
                : ["descripcion", "~", valor as string],
    },
    tipo: {
        id: "tipo",
        campo: "tipo",
        label: "Tipo",
        filtro: (valor) =>
            !valor || valor === "" ? null : ["tipo", "eq", valor as string],
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

export const criteriaCuentasAnualesDefecto = (): Criteria => ({
    ...criteriaDefecto,
    orden: ["id", "DESC"],
});
