import { MaestroConDetalleEjercicio } from "#/contabilidad/ejercicio/maestro/MaestroConDetalleEjercicio.tsx";
import { DetalleEjercicioFiscal } from "./detalle/DetalleEjercicioFiscal.tsx";

/** Fiscalidad > Ejercicios fiscales (ejercicios.ui de facturación): el mismo
 * listado de la tabla `ejercicios` que Contabilidad > Apertura y Cierre de
 * Ejercicio, pero aquí sí se crean ejercicios. */
export const EjerciciosFiscales = () => (
    <MaestroConDetalleEjercicio titulo="Ejercicios fiscales" conAlta Detalle={DetalleEjercicioFiscal} />
);
