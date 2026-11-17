import { MetaTabla } from "@olula/componentes/index.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { Divisa } from "../diseño.ts";

export type EstadoMaestroDivisa = "INICIAL" | "CREANDO";

export type ContextoMaestroDivisa = {
    estado: EstadoMaestroDivisa;
    divisas: ListaActivaEntidades<Divisa>;
};

export const metaTablaDivisa: MetaTabla<Divisa> = [
    { id: "id", cabecera: "Código" },
    { id: "descripcion", cabecera: "Descripción" },
    { id: "tasaConversion", cabecera: "Tasa de conversión", tipo: "numero" },
    { id: "fecha", cabecera: "Fecha de actualización", tipo: "fecha" },
    { id: "simbolo", cabecera: "Símbolo" },
    { id: "codigoIso", cabecera: "Código ISO" },
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

export const metaFiltroDivisa: MetaFiltro = {
    id: filtroTexto("id", "Código"),
    descripcion: filtroTexto("descripcion", "Descripción"),
};

export const criteriaDivisasDefecto = (): Criteria => ({
    ...criteriaDefecto,
    filtro: [],
    orden: ["id", "ASC"],
});
