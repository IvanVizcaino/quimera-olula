import { MetaTabla } from "@olula/componentes/index.js";
import { MetaFiltro } from "@olula/componentes/maestro/maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { Criteria } from "@olula/lib/diseño.ts";
import { criteriaDefecto } from "@olula/lib/dominio.js";
import { ListaActivaEntidades } from "@olula/lib/ListaActivaEntidades.js";
import { FormaPago } from "../diseño.ts";

export type EstadoMaestroFormaPago = "INICIAL" | "CREANDO";

export type ContextoMaestroFormaPago = {
    estado: EstadoMaestroFormaPago;
    formasPago: ListaActivaEntidades<FormaPago>;
};

export const metaTablaFormaPago: MetaTabla<FormaPago> = [
    { id: "id", cabecera: "Código" },
    { id: "descripcion", cabecera: "Descripción" },
    { id: "generaRecibos", cabecera: "Generar recibos como" },
    { id: "cuentaId", cabecera: "Cuenta" },
    { id: "domiciliado", cabecera: "Domiciliado", tipo: "booleano" },
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

export const metaFiltroFormaPago: MetaFiltro = {
    id: filtroTexto("id", "Código"),
    descripcion: filtroTexto("descripcion", "Descripción"),
};

export const criteriaFormasPagoDefecto = (): Criteria => ({
    ...criteriaDefecto,
    filtro: [],
    orden: ["id", "ASC"],
});
