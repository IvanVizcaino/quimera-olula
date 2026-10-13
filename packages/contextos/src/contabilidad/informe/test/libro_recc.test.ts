import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { afterEach, describe, expect, test, vi } from "vitest";
import {
    criteriaLibroRecc,
    fechasEjercicioPorDefecto,
    nombreFicheroPdfInforme,
    opcionesLibroReccVacias,
    validarFiltrosLibroRecc,
} from "../dominio.ts";
import {
    getInformeLibroFacturasRecCcaja,
    libroFacturasRecCcajaDesdeApi,
} from "../infraestructura.ts";

afterEach(() => vi.restoreAllMocks());

const periodo = { ejercicioId: "2026", fechaDesde: "2026-01-01", fechaHasta: "2026-03-31" };

describe("libro IVA recibidas criterio de caja: opciones del formulario Eneboo", () => {
    test("sin opciones solo viaja el período (el backend aplica los defectos)", () => {
        expect(criteriaLibroRecc(periodo, opcionesLibroReccVacias()).filtro).toEqual([
            ["ejercicio_id", "eq", "2026"],
            ["fecha", ">=", "2026-01-01"],
            ["fecha", "<=", "2026-03-31"],
        ]);
    });

    test("todas las opciones usan los nombres del contrato (q con igualdad)", () => {
        const c = criteriaLibroRecc(periodo, {
            codigoSerie: "A",
            conIva: true,
            codImpuesto: "IVA21",
            codGrupoIvaNeg: "NAC",
            numeracionAuto: true,
            numDesde: 15,
            agruparIvaNeg: true,
        });
        expect(c.filtro).toEqual(
            expect.arrayContaining([
                ["codigo_serie", "eq", "A"],
                ["con_iva", "eq", "true"],
                ["cod_impuesto", "eq", "IVA21"],
                ["cod_grupo_iva_neg", "eq", "NAC"],
                ["numeracion_auto", "eq", "true"],
                ["num_desde", "eq", "15"],
                ["agrupar_iva_neg", "eq", "true"],
            ])
        );
    });

    test("num_desde solo se envía con numeración automática", () => {
        const c = criteriaLibroRecc(periodo, { ...opcionesLibroReccVacias(), numDesde: 9 });
        expect(c.filtro).not.toContainEqual(["num_desde", "eq", "9"]);
    });

    test("fechas por defecto = ejercicio completo; ejercicio no numérico no rellena", () => {
        expect(fechasEjercicioPorDefecto("2026")).toEqual({ fechaDesde: "2026-01-01", fechaHasta: "2026-12-31" });
        expect(fechasEjercicioPorDefecto("EJ-A")).toEqual({ fechaDesde: "", fechaHasta: "" });
    });

    test("validación de Eneboo: inicio no posterior a fin; fechas obligatorias en la API", () => {
        expect(validarFiltrosLibroRecc(periodo)).toBeNull();
        expect(validarFiltrosLibroRecc({ ...periodo, fechaDesde: "2026-05-01" })).toBe(
            "La fecha de inicio debe ser menor que la de fin"
        );
        expect(validarFiltrosLibroRecc({ ejercicioId: "2026" })).toMatch(/fechas/);
        expect(validarFiltrosLibroRecc({ ...periodo, ejercicioId: "" })).toMatch(/ejercicio/i);
    });

    test("nombre del PDF alineado con el backend", () => {
        expect(nombreFicheroPdfInforme("libro_facturas_recibidas_ccaja")).toBe(
            "libro-facturas-recibidas-ccaja.pdf"
        );
    });
});

describe("libro IVA recibidas criterio de caja: respuesta", () => {
    const api = {
        datos: [
            {
                partida_id: 1,
                fecha_asiento: "2026-02-03",
                asiento_numero: 10,
                codigo_serie: "A",
                numero_factura: 7,
                numero_factura_proveedor: "F-99",
                codigo_factura: "FAC2026A7",
                codigo_proveedor: "000001",
                nombre_proveedor: "Proveedor SL",
                cif_nif: "B1",
                codigo_subcuenta: "4720000000",
                codigo_contrapartida: "4000000001",
                base_imponible: 100,
                cuota_iva: 21,
                porcentaje_iva: 21,
                porcentaje_recargo: 0,
                cod_impuesto: "IVA21",
                cod_grupo_iva_neg: "RECC",
                tipo_calculo: "Normal",
                codigo_subcuenta_reversion: null,
                documento: "Factura",
                criterio_caja: true,
                recibos: [
                    {
                        recibo_id: 3,
                        codigo: "REC-3",
                        forma_pago_id: "CONT",
                        forma_pago: "Contado",
                        fecha_pago: "2026-03-01",
                        importe: 121,
                    },
                ],
            },
        ],
        total: 1,
        totales: { base: 100, cuota: 21 },
        resumen_iva: [{ nombre: "RECC - IVA21 - 21 - 0", base: 100, cuota: 21, reversion: true, cuota_reversion: 21 }],
        totales_grupo_iva_neg: [{ cod_grupo_iva_neg: "RECC", base: 100, cuota: 21, cuota_reversion: 21 }],
    };

    test("mapea filas, recibos pagados, totales, resumen IVA y subtotales por grupo", () => {
        const libro = libroFacturasRecCcajaDesdeApi(api);
        expect(libro.total).toBe(1);
        expect(libro.totales).toEqual({ base: 100, cuota: 21 });
        const fila = libro.datos[0];
        expect(fila.id).toBe("1");
        expect(fila.numeroFacturaProveedor).toBe("F-99");
        expect(fila.criterioCaja).toBe(true);
        expect(fila.recibos[0]).toMatchObject({ reciboId: 3, codigo: "REC-3", importe: 121 });
        expect(fila.recibos[0].fechaPago).toBeInstanceOf(Date);
        expect(libro.resumenIva).toEqual([
            { nombre: "RECC - IVA21 - 21 - 0", base: 100, cuota: 21, reversion: true, cuotaReversion: 21 },
        ]);
        expect(libro.totalesGrupoIvaNeg).toEqual([
            { codGrupoIvaNeg: "RECC", base: 100, cuota: 21, cuotaReversion: 21 },
        ]);
    });

    test("campos opcionales ausentes (sin iva_nav): listas vacías y totales a 0", () => {
        const libro = libroFacturasRecCcajaDesdeApi({ datos: [], total: 0 });
        expect(libro).toEqual({
            datos: [],
            total: 0,
            totales: { base: 0, cuota: 0 },
            resumenIva: [],
            totalesGrupoIvaNeg: [],
        });
    });

    test("getInformeLibroFacturasRecCcaja consulta la ruta con el q de las opciones", async () => {
        const get = vi.spyOn(RestAPI, "get").mockResolvedValue(api);
        const criteria = criteriaLibroRecc(periodo, { ...opcionesLibroReccVacias(), agruparIvaNeg: true });
        const libro = await getInformeLibroFacturasRecCcaja(criteria);
        expect(libro.totalesGrupoIvaNeg).toHaveLength(1);
        const url = String(get.mock.calls[0][0]);
        expect(url.startsWith("/contabilidad/informe/libro_facturas_recibidas_ccaja?")).toBe(true);
        expect(decodeURIComponent(url)).toContain("agrupar_iva_neg");
    });
});
