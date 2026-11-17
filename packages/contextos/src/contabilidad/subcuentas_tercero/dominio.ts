import { configuracion, puede } from "@olula/lib/dominio.ts";
import { SubcuentaTercero } from "./diseño.ts";

/** La pestaña Contabilidad de cliente y proveedor sólo se ve con contabilidad
 * integrada (`empresa.contintegrada`, llega en el whoami) y si el usuario
 * puede leer subcuentas y partidas. */
export const mostrarPestanaContabilidad = (): boolean =>
    configuracion("contabilidad.contabilidad_integrada") &&
    puede("contabilidad.asiento");

/** Fila elegida al abrir la pestaña: la del ejercicio más reciente. */
export const subcuentaInicial = (
    subcuentas: SubcuentaTercero[]
): SubcuentaTercero | null =>
    subcuentas.reduce<SubcuentaTercero | null>(
        (elegida, s) =>
            !elegida || s.ejercicioId > elegida.ejercicioId ? s : elegida,
        null
    );
