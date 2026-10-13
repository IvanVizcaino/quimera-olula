import { ClausulaFiltro, Filtro } from "@olula/lib/diseño.ts";
import { Articulo } from "./diseño.ts";

export const articuloVacio = (): Articulo => ({
    id: "",
    descripcion: "",
    observaciones: "",
    familiaId: "",
    descripcionFamilia: "",
    grupoIvaProductoId: "",
    noStock: false,
    seCompra: false,
    seVende: false,
});

export const CAMPO_INCLUIR_NO_COMPRABLES = "incluir_no_comprables";

const clausulasAmbosSeCompra: Filtro = {
    or: [
        ["se_compra", "=", "true"],
        ["se_compra", "=", "false"],
    ],
};

const esListaClausulas = (filtro: Filtro): filtro is ClausulaFiltro[] =>
    Array.isArray(filtro) && (filtro.length === 0 || Array.isArray(filtro[0]));

export const filtroArticulosCompra = (filtro: Filtro): Filtro => {
    if (!esListaClausulas(filtro)) return filtro;

    const incluirNoComprables = filtro.some(
        ([campo, , valor]) => campo === CAMPO_INCLUIR_NO_COMPRABLES && valor === "true"
    );
    const resto = filtro.filter(([campo]) => campo !== CAMPO_INCLUIR_NO_COMPRABLES);

    if (!incluirNoComprables) return resto;

    return resto.length ? { and: [clausulasAmbosSeCompra, resto] } : clausulasAmbosSeCompra;
};
