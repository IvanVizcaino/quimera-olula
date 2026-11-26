import { Criteria, Filtro } from "@olula/lib/diseño.ts";
import { MetaModelo } from "@olula/lib/dominio.ts";
import { comoBooleano, primerError, sinTexto } from "../comun/dominio.ts";
import { ComponenteFabricacion, FabricacionArticulo } from "./diseño.ts";

/** Un artículo fabricado necesita un tipo de proceso (el servidor exige además que sea de fabricación). */
export const validarFabricacion = (a: Pick<FabricacionArticulo, "fabricado" | "tipoProcesoId">): string | true =>
    primerError(
        comoBooleano(a.fabricado) && sinTexto(a.tipoProcesoId)
            ? "Un artículo fabricado necesita un tipo de proceso" : null,
    );

export const metaFabricacion: MetaModelo<FabricacionArticulo> = {
    campos: {
        fabricado: { requerido: false, tipo: "checkbox" },
        tipoProcesoId: { requerido: false },
    },
    validacion: validarFabricacion,
};

export const fabricacionVacia = (): FabricacionArticulo => ({
    id: "", descripcion: "", fabricado: false, tipoProcesoId: "", tipoProceso: "", porLotes: false, sinStock: false,
    componentes: [], avisos: [],
});

/** Componentes que aún no tienen tarea de consumo. */
export const componentesSinTarea = (componentes: ComponenteFabricacion[]): ComponenteFabricacion[] =>
    componentes.filter((c) => sinTexto(c.tareaProcesoId));

/** Componentes que van por lotes. */
export const componentesPorLotes = (componentes: ComponenteFabricacion[]): ComponenteFabricacion[] =>
    componentes.filter((c) => c.porLotes);

/**
 * Un artículo fabricado que no va por lotes con algún componente por lotes: la trazabilidad hacia
 * delante se cortaría en sus ventas (el servidor no deja marcarlo fabricado y lo avisa).
 */
export const faltaPorLotes = (a: Pick<FabricacionArticulo, "fabricado" | "porLotes" | "componentes">): boolean =>
    comoBooleano(a.fabricado) && !a.porLotes && componentesPorLotes(a.componentes).length > 0;

/** Criteria de los artículos fabricados cuyo código o descripción contiene `texto` (o el de código `id`). */
export const criteriaArticulosFabricados = (texto: string, id?: string): Criteria => ({
    filtro: (id
        ? [["id", "=", id]]
        : { and: [["fabricado", "=", "true"], { or: [["id", "~", texto], ["descripcion", "~", texto]] }] }) as Filtro,
    orden: ["id", "ASC"],
    paginacion: { pagina: 1, limite: 15 },
});
