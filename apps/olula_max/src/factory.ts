import { FactoryOlula } from "@olula/olula/factory.ts";

/**
 * olula_max hereda de olula todos sus contextos y menús: Ventas, Compras, Almacén
 * (con inventario e informes), Producción, CRM, Contabilidad, Tesorería, Fiscalidad,
 * TPV, RR. HH., Proyectos, Predicciones, Análisis, Empresa, Tablas generales,
 * Administración y el asistente IA.
 *
 * No hace falta nada propio: lo que añade el servidor olula_max son plugins activos
 * (produccion, sga, remesa_pago, presupuesto_parcial, transporte_dachser,
 * transporte_correose, deca…) y las entradas de menú y pantallas condicionadas por
 * `plugin` se muestran solas porque el servidor las devuelve activas en whoami.
 */
export class FactoryOlulaMax extends FactoryOlula { }

export default FactoryOlulaMax;
