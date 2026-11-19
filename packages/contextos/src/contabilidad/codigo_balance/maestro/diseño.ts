import { MetaTabla } from "@olula/componentes/index.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { AlcanceRegeneracion, CodigoBalance } from "../diseño.ts";

export type EstadoMaestroCodigoBalance = "INICIAL" | "CREANDO" | "REGENERANDO";

export type ContextoMaestroCodigoBalance = {
    estado: EstadoMaestroCodigoBalance;
    codigosBalance: ListaActivaEntidades<CodigoBalance>;
    alcanceRegeneracion: AlcanceRegeneracion | null;
};

export const metaTablaCodigoBalance: MetaTabla<CodigoBalance> = [
    { id: "id", cabecera: "Código" },
    { id: "naturaleza", cabecera: "Nat." },
    { id: "descripcion1", cabecera: "Nivel 1" },
    { id: "descripcion2", cabecera: "Nivel 2" },
    { id: "descripcion3", cabecera: "Nivel 3" },
    { id: "descripcion4", cabecera: "Nivel 4" },
];

const filtroTexto = (campo: string, label: string) => ({
    id: campo,
    campo,
    label,
    filtro: (valor: unknown) => {
        if (!valor || valor === "") return null;
        return [campo, "~", valor as string] as [string, string, string];
    },
});

/** Filtro explícito con los nombres de campo de la API. */
export const metaFiltroCodigoBalance: MetaFiltro = {
    id: filtroTexto("id", "Código"),
    naturaleza: {
        id: "naturaleza",
        campo: "naturaleza",
        label: "Naturaleza (A, P, PG, IG)",
        filtro: (valor) => {
            if (!valor || valor === "") return null;
            return ["naturaleza", "=", (valor as string).toUpperCase()];
        },
    },
    descripcion3: filtroTexto("descripcion3", "Nivel 3"),
    descripcion4: filtroTexto("descripcion4", "Nivel 4"),
};

/** Por código, como el maestro de Eneboo. */
export const criteriaCodigosBalanceDefecto = (): Criteria => ({
    ...criteriaDefecto,
    filtro: [],
    orden: ["id", "ASC"],
});
