import { configuracion, formatearMoneda, puede } from "@olula/lib/dominio.ts";
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

/** Texto de la subcuenta en el combo: «ejercicio · subcuenta · saldo». */
export const descripcionOpcionSubcuenta = (s: SubcuentaTercero): string =>
    `${s.ejercicioId} · ${s.codigoSubcuenta} · ${formatearMoneda(s.saldo ?? 0, "EUR")}`;

/** Opciones del combo de subcuentas por ejercicio, del más reciente al más antiguo. */
export const opcionesSubcuentas = (subcuentas: SubcuentaTercero[]) =>
    [...subcuentas]
        .sort((a, b) => b.ejercicioId.localeCompare(a.ejercicioId))
        .map((s) => ({ valor: s.id, descripcion: descripcionOpcionSubcuenta(s) }));
