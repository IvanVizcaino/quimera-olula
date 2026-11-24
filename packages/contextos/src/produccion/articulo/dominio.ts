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
    id: "", descripcion: "", fabricado: false, tipoProcesoId: "", tipoProceso: "", sinStock: false,
    componentes: [], avisos: [],
});

/** Componentes que aún no tienen tarea de consumo. */
export const componentesSinTarea = (componentes: ComponenteFabricacion[]): ComponenteFabricacion[] =>
    componentes.filter((c) => sinTexto(c.tareaProcesoId));
