import { MetaTabla } from "@olula/componentes/index.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Pais } from "../diseño.ts";

export type EstadoMaestroPais = "INICIAL" | "CREANDO";

export type ContextoMaestroPais = {
    estado: EstadoMaestroPais;
    paises: ListaActivaEntidades<Pais>;
};

export const metaTablaPais: MetaTabla<Pais> = [
    { id: "id", cabecera: "Código" },
    { id: "nombre", cabecera: "Nombre" },
    { id: "codiso", cabecera: "Código I.S.O." },
    { id: "descripcionZona", cabecera: "Zona geográfica" },
    { id: "enUe", cabecera: "U.E.", tipo: "booleano" },
    { id: "zonaSepa", cabecera: "SEPA", tipo: "booleano" },
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

export const metaFiltroPais: MetaFiltro = {
    id: filtroTexto("id", "Código"),
    nombre: filtroTexto("nombre", "Nombre"),
};

export const criteriaPaisesDefecto = (): Criteria => ({
    ...criteriaDefecto,
    filtro: [],
    orden: ["id", "ASC"],
});
