import { MetaTabla } from "@olula/componentes/index.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Provincia } from "../diseño.ts";

export type EstadoMaestroProvincia = "INICIAL" | "CREANDO";

export type ContextoMaestroProvincia = {
    estado: EstadoMaestroProvincia;
    provincias: ListaActivaEntidades<Provincia>;
};

export const metaTablaProvincia: MetaTabla<Provincia> = [
    { id: "nombre", cabecera: "Provincia" },
    { id: "codigo", cabecera: "Código" },
    { id: "paisId", cabecera: "País" },
    { id: "nombrePais", cabecera: "Nombre del país" },
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

export const metaFiltroProvincia: MetaFiltro = {
    nombre: filtroTexto("nombre", "Provincia"),
    pais_id: filtroTexto("pais_id", "País"),
};

export const criteriaProvinciasDefecto = (): Criteria => ({
    ...criteriaDefecto,
    filtro: [],
    orden: ["nombre", "ASC"],
});
