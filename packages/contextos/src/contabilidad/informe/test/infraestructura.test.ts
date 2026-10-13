import { describe, expect, test } from "vitest";
import { criteriaInformePeriodo } from "../dominio.ts";
import {
    cabeceraMayorDesdeApi,
    filaBalanceDesdeApi,
    filaLibroFacturasIvaDesdeApi,
    filaSumasSaldosDesdeApi,
    informeMayorDesdeApi,
    lineaDiarioDesdeApi,
    lineaMayorDesdeApi,
    urlReportInforme,
} from "../infraestructura.ts";

describe("mappers informe contable (T6.1)", () => {
    test("lineaMayorDesdeApi", () => {
        const linea = lineaMayorDesdeApi({
            partida_id: 7,
            asiento_id: 3,
            asiento_numero: 12,
            fecha: "2026-02-10",
            concepto: "Venta",
            debe: 100,
            haber: 0,
            saldo: 100,
        });

        expect(linea.id).toBe("7");
        expect(linea.asientoNumero).toBe(12);
        expect(linea.fecha.getFullYear()).toBe(2026);
    });

    test("informeMayorDesdeApi mapea cabecera y líneas", () => {
        const informe = informeMayorDesdeApi({
            cabecera: {
                subcuenta_id: 1,
                codigo_subcuenta: "4300000001",
                descripcion_subcuenta: "Cliente",
                saldo_inicial: 50,
                saldo_final: 150,
            },
            lineas: [],
            total: 0,
        });

        expect(informe.cabecera.saldoFinal).toBe(150);
        expect(informe.cabecera.codigoSubcuenta).toBe("4300000001");
        expect(
            cabeceraMayorDesdeApi({
                subcuenta_id: 1,
                codigo_subcuenta: "4300000001",
                descripcion_subcuenta: "Cliente",
                saldo_inicial: 50,
                saldo_final: 150,
            }).saldoInicial
        ).toBe(50);
    });

    test("filaSumasSaldosDesdeApi", () => {
        const fila = filaSumasSaldosDesdeApi({
            subcuenta_id: 99,
            codigo_subcuenta: "5720000000",
            descripcion_subcuenta: "Bancos",
            codigo_cuenta: "572",
            descripcion_cuenta: "Bancos e",
            debe_periodo: 1000,
            haber_periodo: 200,
            saldo_inicial: 0,
            saldo_debe: 800,
            saldo_haber: 0,
        });

        expect(fila.id).toBe("99");
        expect(fila.saldoDebe).toBe(800);
    });

    test("filaBalanceDesdeApi", () => {
        const fila = filaBalanceDesdeApi({
            codigo_balance: "A1",
            naturaleza: "ACTIVO",
            nivel1: "Activo",
            descripcion_balance: "Inmovilizado",
            codigo_cuenta: "210",
            descripcion_cuenta: "Terrenos",
            debe: 0,
            haber: 0,
            saldo: 50000,
        });

        expect(fila.id).toBe("A1-210");
        expect(fila.saldo).toBe(50000);
    });

    test("lineaDiarioDesdeApi", () => {
        const linea = lineaDiarioDesdeApi({
            partida_id: 11,
            asiento_id: 4,
            asiento_numero: 99,
            fecha: "2026-05-01",
            concepto_asiento: "Cierre",
            codigo_subcuenta: "4300000001",
            concepto: "Cliente X",
            debe: 10,
            haber: 0,
        });

        expect(linea.id).toBe("11");
        expect(linea.conceptoAsiento).toBe("Cierre");
        expect(linea.asientoNumero).toBe(99);
    });

    test("urlReportInforme incluye tipo y q", () => {
        const c = criteriaInformePeriodo({ ejercicioId: "2026" });
        const url = urlReportInforme("pyg", c);
        expect(url.startsWith("/contabilidad/informe/pyg/report?q=")).toBe(true);
        expect(decodeURIComponent(url)).toContain("ejercicio_id");
    });

    test("filaLibroFacturasIvaDesdeApi (M-06)", () => {
        const fila = filaLibroFacturasIvaDesdeApi({
            partida_id: 42,
            fecha_asiento: "2026-02-01",
            asiento_numero: 5,
            codigo_serie: "FAC",
            numero_factura: "100",
            codigo_factura: "2026A0001",
            nombre_tercero: "Cliente SA",
            codigo_tercero: "C001",
            cif_nif: "B12345678",
            codigo_contrapartida: "43000001",
            nombre_contrapartida: "Cliente SA",
            base_imponible: 100,
            cuota_iva: 21,
            porcentaje_iva: 21,
            porcentaje_recargo: 0,
            cod_impuesto: "IVA21",
            cod_grupo_iva_neg: null,
            tipo_calculo: null,
            documento: "FV-1",
        });

        expect(fila.id).toBe("42");
        expect(fila.codigoFactura).toBe("2026A0001");
        expect(fila.cuotaIva).toBe(21);
    });

    test("urlReportInforme libros IVA emitidas/recibidas", () => {
        const c = criteriaInformePeriodo({
            ejercicioId: "2026",
            fechaDesde: "2026-01-01",
            fechaHasta: "2026-03-31",
        });
        expect(urlReportInforme("libro_facturas_emitidas", c)).toMatch(
            /^\/contabilidad\/informe\/libro_facturas_emitidas\/report\?q=/
        );
        expect(urlReportInforme("libro_facturas_recibidas", c)).toMatch(
            /^\/contabilidad\/informe\/libro_facturas_recibidas\/report\?q=/
        );
    });
});
