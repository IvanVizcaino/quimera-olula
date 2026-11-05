import { metaNuevaVentaClienteNoRegistrado, nuevaVentaClienteNoRegistradaVacia } from "#/ventas/venta/dominio.ts";
import { MetaModelo } from "@olula/lib/dominio.js";
import { NuevoPresupuesto, NuevoPresupuestoClienteNoRegistrado } from "../diseño.ts";

export const nuevoPresupuestoVacio: NuevoPresupuesto = {
    cliente_id: "",
    direccion_id: "",
    empresa_id: "",
};

export const metaNuevoPresupuesto: MetaModelo<NuevoPresupuesto> = {
    campos: {
        cliente_id: { requerido: true },
        direccion_id: { requerido: true },
        empresa_id: { requerido: true },
    }
};

export const nuevoPresupuestoClienteNoRegistradoVacio: NuevoPresupuestoClienteNoRegistrado =
    nuevaVentaClienteNoRegistradaVacia;

export const metaNuevoPresupuestoClienteNoRegistrado: MetaModelo<NuevoPresupuestoClienteNoRegistrado> =
    metaNuevaVentaClienteNoRegistrado;
