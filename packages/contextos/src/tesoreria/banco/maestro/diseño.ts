import { MetaTabla } from "@olula/componentes/index.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Banco } from "../diseño.ts";

export type EstadoMaestroBanco = "INICIAL" | "CREANDO";

export type ContextoMaestroBanco = {
    estado: EstadoMaestroBanco;
    bancos: ListaActivaEntidades<Banco>;
};

export const metaTablaBanco: MetaTabla<Banco> = [
    { id: "id", cabecera: "Nº de entidad" },
    { id: "nombre", cabecera: "Nombre" },
    { id: "nombreProveedor", cabecera: "Acreedor" },
    { id: "bicDefecto", cabecera: "BIC por defecto" },
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

export const metaFiltroBanco: MetaFiltro = {
    id: filtroTexto("id", "Nº de entidad"),
    nombre: filtroTexto("nombre", "Nombre"),
};

export const criteriaBancosDefecto = (): Criteria => ({
    ...criteriaDefecto,
    filtro: [],
    orden: ["id", "ASC"],
});
