import { completarOpcionesTpv, botonOculto, opcionesTpvPorDefecto } from "#/tpv/config/dominio.ts";
import { configTpvDesdeAPI } from "#/tpv/config/infraestructura.ts";
import { planImpresionVenta, primerPasoSiguienteVenta } from "#/tpv/venta/impresion.ts";
import type { PagoVentaTpv } from "#/tpv/venta/diseño.ts";
import { describe, expect, test } from "vitest";

const VALE = "VALE";
const pago = (p: Partial<PagoVentaTpv>) => ({ formaPago: "EFECTIVO", vale: null, saldoVale: null, ...p }) as PagoVentaTpv;
const venta = (total: number, cliente: unknown = null, codigo = "TV-001") => ({ total, cliente, codigo }) as never;

const opcionesCrema = completarOpcionesTpv({
    botones_ocultos: ["uno_mas", "uno_menos", "descuento"],
    ticket_regalo: "preguntar_una_vez",
    devolucion_imprimir: "vale_si_pago_vale_sin_tique",
    emitir_vale_reimprime_tique: false,
    emitir_vale_avanza_siempre: true,
    imprimir_tique_al_cobrar: true,
    abrir_cajon_al_cobrar: true,
    pasar_siguiente_venta_auto: true,
    confirmar_siguiente_venta: true,
});

describe("opciones TPV: defaults (= comportamiento actual)", () => {
    test("sin opciones en la respuesta se usan los valores por defecto", () => {
        expect(completarOpcionesTpv(undefined)).toEqual(opcionesTpvPorDefecto);
        const config = configTpvDesdeAPI({
            cliente_id: "1", forma_pago_efectivo_id: "E", forma_pago_tarjeta_id: "T",
            forma_pago_vale_id: VALE, serie_id: "TV", tipos_tarjeta: [],
        });
        expect(config.opciones).toEqual(opcionesTpvPorDefecto);
    });

    test("opciones parciales o inválidas se completan con los defectos", () => {
        const o = completarOpcionesTpv({ ticket_regalo: "raro", pasar_siguiente_venta_auto: true });
        expect(o.ticketRegalo).toBe("no_preguntar");
        expect(o.pasarSiguienteVentaAuto).toBe(true);
        expect(o.botonesOcultos).toEqual([]);
    });

    test("no se oculta ningún botón", () => {
        expect(botonOculto(opcionesTpvPorDefecto, "descuento")).toBe(false);
    });

    test("emitir vale avanza siempre: false por defecto, true en Crema", () => {
        expect(opcionesTpvPorDefecto.emitirValeAvanzaSiempre).toBe(false);
        expect(opcionesCrema.emitirValeAvanzaSiempre).toBe(true);
    });

    test("el cajón no se abre solo por defecto", () => {
        expect(opcionesTpvPorDefecto.abrirCajonAlCobrar).toBe(false);
        expect(opcionesCrema.abrirCajonAlCobrar).toBe(true);
    });

    test("no se pasa solo a la siguiente venta ni se pregunta el regalo", () => {
        expect(primerPasoSiguienteVenta(venta(10), opcionesTpvPorDefecto)).toBeNull();
    });

    test("venta con cliente: factura y ningún vale", () => {
        const plan = planImpresionVenta(venta(10, { id: "C" }), [pago({ vale: "V1", saldoVale: 5 })], opcionesTpvPorDefecto, VALE);
        expect(plan).toEqual({ documento: "factura", vales: [] });
    });

    test("venta sin cliente: tique y vales con saldo", () => {
        const pagos = [pago({ vale: "V1", saldoVale: 5 }), pago({ vale: "V2", saldoVale: 0 }), pago({})];
        expect(planImpresionVenta(venta(10), pagos, opcionesTpvPorDefecto, VALE))
            .toEqual({ documento: "tique", vales: ["V1"] });
    });

    test("devolución pagada con vale: tique y vale", () => {
        const pagos = [pago({ formaPago: VALE, vale: "V9", saldoVale: 8 })];
        expect(planImpresionVenta(venta(-8), pagos, opcionesTpvPorDefecto, VALE))
            .toEqual({ documento: "tique", vales: ["V9"] });
    });
});

describe("opciones TPV: valores de Crema (CC-12)", () => {
    test("oculta +1, -1 y descuento", () => {
        expect(botonOculto(opcionesCrema, "uno_mas")).toBe(true);
        expect(botonOculto(opcionesCrema, "uno_menos")).toBe(true);
        expect(botonOculto(opcionesCrema, "descuento")).toBe(true);
    });

    test("devolución pagada con vale: solo el vale, sin tique", () => {
        const pagos = [pago({ formaPago: VALE, vale: "V9", saldoVale: 8 })];
        expect(planImpresionVenta(venta(-8), pagos, opcionesCrema, VALE))
            .toEqual({ documento: null, vales: ["V9"] });
    });

    test("devolución con pago VALE sin ref en pago: imprime por código de venta (Eneboo imprimirValeEmitido)", () => {
        const pagos = [pago({ formaPago: VALE })];
        expect(planImpresionVenta(venta(-8, null, "DEV-42"), pagos, opcionesCrema, VALE))
            .toEqual({ documento: null, vales: ["DEV-42"] });
    });

    test("el pago con vale se compara con la forma de pago configurada, no con el literal", () => {
        const pagos = [pago({ formaPago: "VALE", vale: "V9", saldoVale: 8 })];
        expect(planImpresionVenta(venta(-8), pagos, opcionesCrema, "BONO"))
            .toEqual({ documento: "tique", vales: ["V9"] });
        expect(planImpresionVenta(venta(-8), [pago({ formaPago: "BONO", vale: "V9", saldoVale: 8 })], opcionesCrema, "BONO"))
            .toEqual({ documento: null, vales: ["V9"] });
    });

    test("devolución sin pago con vale: solo tique", () => {
        expect(planImpresionVenta(venta(-8), [pago({})], opcionesCrema, VALE))
            .toEqual({ documento: "tique", vales: [] });
    });

    test("devolución con 'tique': nunca vale", () => {
        const o = completarOpcionesTpv({ devolucion_imprimir: "tique" });
        const pagos = [pago({ formaPago: VALE, vale: "V9", saldoVale: 8 })];
        expect(planImpresionVenta(venta(-8), pagos, o, VALE)).toEqual({ documento: "tique", vales: [] });
    });

    test("la venta normal no cambia con la opción de devolución", () => {
        const pagos = [pago({ vale: "V1", saldoVale: 5 })];
        expect(planImpresionVenta(venta(10), pagos, opcionesCrema, VALE))
            .toEqual({ documento: "tique", vales: ["V1"] });
    });

    test("tras cobrar pregunta el regalo una vez y pide confirmación", () => {
        expect(primerPasoSiguienteVenta(venta(10), opcionesCrema)).toBe("REGALO");
    });

    test("sin confirmación pasa directamente; sin regalo se salta la pregunta", () => {
        const o = completarOpcionesTpv({ pasar_siguiente_venta_auto: true, confirmar_siguiente_venta: false, ticket_regalo: "no_preguntar" });
        expect(primerPasoSiguienteVenta(venta(10), o)).toBe("PASAR");
        const o2 = completarOpcionesTpv({ pasar_siguiente_venta_auto: true, ticket_regalo: "no_preguntar" });
        expect(primerPasoSiguienteVenta(venta(10), o2)).toBe("CONFIRMAR");
    });

    test("como en Eneboo, pregunta el regalo también en devoluciones", () => {
        expect(primerPasoSiguienteVenta(venta(-5), opcionesCrema)).toBe("REGALO");
    });
});
