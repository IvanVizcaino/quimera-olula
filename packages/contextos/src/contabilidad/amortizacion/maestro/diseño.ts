import { MetaTabla } from "@olula/componentes/index.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Amortizacion } from "../diseño.ts";

export type EstadoMaestroAmortizacion = "INICIAL" | "CREANDO" | "GENERANDO" | "DESHACIENDO";

export type ContextoMaestroAmortizacion = {
    estado: EstadoMaestroAmortizacion;
    amortizaciones: ListaActivaEntidades<Amortizacion>;
};

export const metaTablaAmortizacion: MetaTabla<Amortizacion> = [
    { id: "id", cabecera: "Código" },
    { id: "elemento", cabecera: "Elemento" },
    { id: "estado", cabecera: "Estado" },
    { id: "fecha", cabecera: "Adquisición", tipo: "fecha" },
    { id: "grupoId", cabecera: "Grupo" },
    { id: "valorAmortizable", cabecera: "V. amortizable", tipo: "moneda" },
    { id: "totalAmortizado", cabecera: "Amortizado", tipo: "moneda" },
    { id: "pendiente", cabecera: "Pendiente", tipo: "moneda" },
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

export const metaFiltroAmortizacion: MetaFiltro = {
    id: filtroTexto("id", "Código"),
    elemento: filtroTexto("elemento", "Elemento"),
    grupo_id: filtroTexto("grupo_id", "Grupo"),
    estado: {
        id: "estado",
        campo: "estado",
        label: "Estado (En Curso, Terminada, Suspendida, Cerrada)",
        filtro: (valor) => {
            if (!valor || valor === "") return null;
            return ["estado", "=", valor as string];
        },
    },
};

export const criteriaAmortizacionesDefecto = (): Criteria => ({
    ...criteriaDefecto,
    filtro: [],
    orden: ["id", "ASC"],
});
