import { describe, expect, test } from "vitest";
import { cambiosAmortizacion } from "../detalle/detalle.ts";
import { amortizacionVacia, esFinDeMes, finDeMes, planBloqueado, resumenGeneracion } from "../dominio.ts";
import {
    amortizacionDesdeApi,
    cambiosAmortizacionAApi,
    informeDesdeApi,
    nuevaAmortizacionAApi,
    parametrosInforme,
} from "../infraestructura.ts";

const valores = {
    coste_inicio: 12000, adicion: 0, venta: 0, coste_fin: 12000, amortizacion_inicio: 604.93,
    amortizacion_periodo: 1200, venta_amortizacion_periodo: 0, amortizacion_fin: 1804.93,
    valor_inicio: 11395.07, valor_fin: 10195.07,
};

describe("amortizaciones (co_amortizaciones)", () => {
    test("fin de mes de la fecha límite", () => {
        expect(finDeMes(new Date(2026, 1, 10))).toEqual(new Date(2026, 2, 0, 12));
        expect(esFinDeMes(new Date(2026, 1, 28, 12))).toBe(true);
        expect(esFinDeMes(new Date(2028, 1, 28, 12))).toBe(false);
    });

    test("el plan se bloquea con dotaciones o cerrada", () => {
        expect(planBloqueado(amortizacionVacia())).toBe(false);
        expect(planBloqueado({ ...amortizacionVacia(), totalAmortizado: 10 })).toBe(true);
        expect(planBloqueado({ ...amortizacionVacia(), estado: "Cerrada" })).toBe(true);
    });

    test("cambios solo de lo editado y fechas en AAAA-MM-DD", () => {
        const previa = { ...amortizacionVacia(), id: "000001", fecha: new Date(2026, 6, 1, 12) };
        const actual = { ...previa, fecha: new Date(2026, 6, 2, 12), porcentajeAnual: 10 };
        const cambios = cambiosAmortizacion(previa, actual);
        expect(cambios).toEqual({ fecha: actual.fecha, porcentajeAnual: 10 });
        expect(cambiosAmortizacionAApi(cambios)).toEqual({ fecha: "2026-07-02", porcentaje_anual: 10 });
    });

    test("alta sin código deja que el servidor use el contador", () => {
        const api = nuevaAmortizacionAApi({
            id: " ", elemento: "Torno", grupoId: "MAQ", fecha: new Date(2026, 6, 1, 12),
            fechaInicio: new Date(2026, 6, 1, 12), valorAdquisicion: 12000, valorResidual: 0,
            periodo: "Anual", porcentajeAnual: 10, bloqueado: false, notas: "",
        });
        expect(api).not.toHaveProperty("id");
        expect(api).toMatchObject({ grupo_id: "MAQ", fecha_inicio: "2026-07-01", valor_adquisicion: 12000 });
    });

    test("amortizacionDesdeApi", () => {
        const a = amortizacionDesdeApi({
            id: "000001", elemento: "Torno", estado: "En Curso", fecha: "2026-07-01",
            fecha_inicio: "2026-07-01", valor_adquisicion: 12000, valor_residual: 0,
            valor_amortizable: 12000, metodo: "Lineal", periodo: "Anual", porcentaje_periodo: 10,
            porcentaje_anual: 10, num_periodos: 10, amortizacion_periodo: 1200,
            amortizacion_primer_periodo: 604.93, amortizacion_ultimo_periodo: 595.07,
            total_amortizado: 0, pendiente: 12000, grupo_id: "MAQ", descripcion_grupo: null,
            bloqueado: false, no_generar_asiento_cierre: false, fecha_cierre: null,
            asiento_cierre_id: null, numero_asiento_cierre: null, ejercicio_asiento_cierre: null,
            vendido: false, factura_venta_id: null, codigo_factura_venta: null, notas: null,
        });
        expect(a.fecha.getDate()).toBe(1);
        expect(a.fechaCierre).toBeNull();
        expect(a.descripcionGrupo).toBe("");
    });

    test("informe y parámetros", () => {
        const informe = informeDesdeApi({
            ejercicio_id: "2027", fecha_inicio: "2027-01-01", fecha_fin: "2027-12-31",
            cuentas: [{ codigo_cuenta: "213", descripcion: null, total: valores,
                lineas: [{ amortizacion_id: "000001", elemento: "Torno", ...valores }] }],
            total: valores,
        });
        expect(informe.cuentas[0].lineas[0].valorFin).toBe(10195.07);
        expect(parametrosInforme({
            ejercicioId: "2027", grupoId: "MAQ", codigoCuenta: "", amortizacionId: "", descripcion: "",
        })).toBe("ejercicio_id=2027&grupo_id=MAQ");
    });

    test("resumen de la generación", () => {
        expect(resumenGeneracion({ totalDotaciones: 0, importe: 0, amortizaciones: [] }))
            .toBe("No es necesario generar dotaciones");
        expect(resumenGeneracion({
            totalDotaciones: 1, importe: 604.93,
            amortizaciones: [{ id: "000001", elemento: "Torno",
                dotaciones: [{ fechaInicio: "2026-07-01", fechaFin: "2026-12-31", importe: 604.93 }] }],
        })).toContain("Elemento: Torno");
    });
});
