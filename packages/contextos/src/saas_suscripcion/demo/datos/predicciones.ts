import { DemoModulo } from "../diseño.ts";
import { ARTICULOS, fecha } from "./comun.ts";

/**
 * Demo de Predicciones: facturación mensual y semanal (histórico real + previsión con su
 * intervalo), previsión de unidades por referencia (para Ventas y Stock) y métricas de
 * calidad de los modelos. Mismo orden de magnitud que la demo de Análisis (~820.000 €/año).
 */

const HOY = new Date();
const AÑO = HOY.getFullYear();
const MES = HOY.getMonth();

const dos = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
const redondear = (n: number) => Math.round(n * 100) / 100;

const ruido = (clave: string, amplitud: number): number => {
    let h = 2166136261;
    for (let i = 0; i < clave.length; i++) {
        h ^= clave.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return 1 + amplitud * ((((h >>> 0) % 2001) / 1000) - 1);
};

const ESTACION = [0.84, 0.8, 0.93, 0.99, 1.09, 1.19, 1.25, 1.16, 1.02, 0.95, 0.88, 0.9];
const ANUAL = 824000;
const crecimiento = (año: number) => 1.09 ** (año - AÑO);
const EJECUCION = `${fecha(-2)}T05:30:00`;

/** Fila de facturación: con real hasta el periodo en curso; desde él, solo previsión. */
const filaFacturacion = (id: string, d: Date, base: number, esReal: boolean, margen: number) => {
    const real = esReal ? redondear(base * ruido(`real${id}`, 0.07)) : null;
    const prediccion = redondear(base * ruido(`pred${id}`, 0.03));
    return {
        id,
        fecha: iso(d),
        prediccion,
        limite_inferior: redondear(prediccion * (1 - margen)),
        limite_superior: redondear(prediccion * (1 + margen)),
        facturacion_real: real,
        diferencia: real === null ? null : redondear(real - prediccion),
        desviacion_porcentaje: real === null ? null : redondear(((real - prediccion) / prediccion) * 100),
        fecha_ejecucion: EJECUCION,
    };
};

/** Año pasado completo, este año (real hasta el mes anterior) y el primer semestre del próximo. */
const FACTURACION_MENSUAL = [AÑO - 1, AÑO, AÑO + 1].flatMap((año) =>
    Array.from({ length: año > AÑO ? 6 : 12 }, (_, mes) => {
        const d = new Date(año, mes, 1);
        const esReal = año < AÑO || (año === AÑO && mes < MES);
        const lejania = (año - AÑO) * 12 + mes - MES;
        return filaFacturacion(`m${año}${dos(mes + 1)}`, d, (ANUAL / 12) * ESTACION[mes] * crecimiento(año),
            esReal, 0.06 + Math.max(0, lejania) * 0.012);
    }));

const lunesActual = new Date(AÑO, MES, HOY.getDate() - ((HOY.getDay() + 6) % 7));

/** De 14 semanas atrás a 17 adelante (la pantalla enseña de 3 meses antes a 3 después). */
const FACTURACION_SEMANAL = Array.from({ length: 32 }, (_, i) => {
    const semana = i - 14;
    const d = new Date(lunesActual.getFullYear(), lunesActual.getMonth(), lunesActual.getDate() + semana * 7);
    return filaFacturacion(`s${iso(d)}`, d, (ANUAL / 52) * ESTACION[d.getMonth()] * crecimiento(d.getFullYear()),
        semana < 0, 0.08 + Math.max(0, semana) * 0.01);
});

/** Subfamilia y unidades previstas por semana de cada artículo (ver ARTICULOS). */
const PREVISION: Record<string, { subfamilia: string; semanal: number }> = {
    TOM01: { subfamilia: "Tomate", semanal: 300 },
    PIM01: { subfamilia: "Pimiento", semanal: 85 },
    PEP01: { subfamilia: "Pepino", semanal: 55 },
    NAR01: { subfamilia: "Cítricos", semanal: 120 },
    LIM01: { subfamilia: "Cítricos", semanal: 45 },
    AGU01: { subfamilia: "Tropical", semanal: 40 },
    CAJ01: { subfamilia: "Cajas", semanal: 140 },
};

const filaReferencia = (articulo: (typeof ARTICULOS)[number], d: Date, unidades: number, real: number | null, clave: string) => ({
    id: `${articulo.referencia}_${clave}`,
    referencia: articulo.referencia,
    subfamilia: PREVISION[articulo.referencia].subfamilia,
    familia: articulo.familia,
    pvp: articulo.pvp,
    fecha: iso(d),
    ventas_prediccion: Math.round(unidades),
    ventas_real: real,
    diferencia: real === null ? null : Math.round(real - unidades),
    desviacion_porcentaje: real === null ? null : redondear(((real - unidades) / unidades) * 100),
    fecha_ejecucion: EJECUCION,
    stock_actual: articulo.stock,
});

/** Mes en curso y los dos siguientes. */
const VENTAS_REF_MENSUAL = ARTICULOS.flatMap((a) => [0, 1, 2].map((n) => {
    const d = new Date(AÑO, MES + n, 1);
    const unidades = PREVISION[a.referencia].semanal * 4.33 * (ESTACION[d.getMonth()] / ESTACION[MES])
        * ruido(`${a.referencia}${n}`, 0.06);
    return filaReferencia(a, d, unidades, null, iso(d));
}));

/** Semana en curso y las cinco siguientes. */
const VENTAS_REF_SEMANAL = ARTICULOS.flatMap((a) => [0, 1, 2, 3, 4, 5].map((n) => {
    const d = new Date(lunesActual.getFullYear(), lunesActual.getMonth(), lunesActual.getDate() + n * 7);
    return filaReferencia(a, d, PREVISION[a.referencia].semanal * ruido(`${a.referencia}s${n}`, 0.08), null, `s${iso(d)}`);
}));

const metrica = (id: string, nombreDataset: string, frecuencia: string, metricas: Record<string, unknown>) => ({
    id, nombre_dataset: nombreDataset, frecuencia, fecha: fecha(-2), fecha_calculo: `${fecha(-2)} 05:30`, metricas,
});

export const demo: DemoModulo = {
    pantallas: [
        { nombre: "Previsión de ventas", ruta: "/predicciones/dashboard" },
        { nombre: "Stock frente a previsión", ruta: "/predicciones/stock" },
        { nombre: "Calidad de los modelos", ruta: "/predicciones/metricas" },
    ],
    guia: "Compara lo facturado con la previsión, cambia a vista semanal y mira qué referencias se quedarán sin stock.",
    colecciones: {
        "predicciones/facturacion_global_mensual": FACTURACION_MENSUAL,
        "predicciones/facturacion_global_semanal": FACTURACION_SEMANAL,
        "predicciones/ventas_ref_pvp_mensual": VENTAS_REF_MENSUAL,
        "predicciones/ventas_ref_pvp_semanal": VENTAS_REF_SEMANAL,
        "predicciones/metricas_calidad": [
            metrica("q1", "facturacion_global_mensual", "mensual", {
                Accuracy_porcentaje: 94.2, MAPE_porcentaje: 5.8, MAE: 3810.4, RMSE: 4655.1,
                Cobertura_Intervalo_pct: 91.7, total_entidades_evaluadas: 12, agrupacion: ["empresa"],
            }),
            metrica("q2", "facturacion_global_semanal", "semanal", {
                Accuracy_porcentaje: 89.6, MAPE_porcentaje: 10.4, MAE: 1630.9, RMSE: 2104.3,
                Cobertura_Intervalo_pct: 86.5, total_entidades_evaluadas: 26, agrupacion: ["empresa"],
            }),
            metrica("q3", "ventas_ref_pvp_mensual", "mensual", {
                Accuracy_porcentaje: 87.3, WAPE_porcentaje: 12.7, MAE: 58.2, RMSE: 81.6,
                Sesgo_Unidades: -6.4, total_referencias_evaluadas: 7, agrupacion: ["referencia", "pvp"],
            }),
            metrica("q4", "ventas_ref_pvp_semanal", "semanal", {
                Accuracy_porcentaje: 82.9, WAPE_porcentaje: 17.1, MAE: 19.7, RMSE: 27.3,
                Sesgo_Unidades: 2.1, total_referencias_evaluadas: 7, agrupacion: ["referencia", "pvp"],
            }),
        ],
    },
};
