import { MetaTabla } from "@olula/componentes/index.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { GrupoContableAmortizacion } from "../diseño.ts";

export type EstadoMaestroGrupoContableAmortizacion = "INICIAL" | "CREANDO";

export type ContextoMaestroGrupoContableAmortizacion = {
    estado: EstadoMaestroGrupoContableAmortizacion;
    grupos: ListaActivaEntidades<GrupoContableAmortizacion>;
};

export const metaTablaGrupoContableAmortizacion: MetaTabla<GrupoContableAmortizacion> = [
    { id: "id", cabecera: "Código" },
    { id: "descripcion", cabecera: "Descripción" },
    { id: "subcuentaElemento", cabecera: "S. Elemento" },
    { id: "subcuentaAmortizacion", cabecera: "S. Amortización" },
    { id: "subcuentaGasto", cabecera: "S. Gastos" },
    { id: "subcuentaPerdidas", cabecera: "S. Pérdidas" },
    { id: "subcuentaGanancias", cabecera: "S. Ganancias" },
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

export const metaFiltroGrupoContableAmortizacion: MetaFiltro = {
    id: filtroTexto("id", "Código"),
    descripcion: filtroTexto("descripcion", "Descripción"),
};

export const criteriaGruposDefecto = (): Criteria => ({
    ...criteriaDefecto,
    filtro: [],
    orden: ["id", "ASC"],
});
