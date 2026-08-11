import { Presupuesto } from "#/ventas/presupuesto/diseño.ts";
import { ListaEntidades } from "@olula/lib/ListaEntidades.js";

export type EstadoPresupuestosOportunidad = "INICIAL" | "BORRANDO";

export type ContextoPresupuestosOportunidad = {
    estado: EstadoPresupuestosOportunidad;
    presupuestos: ListaEntidades<Presupuesto>;
};