import { describe, expect, test } from "vitest";
import {
    filtroRecibosPendientesCobro,
    filtroRecibosVencidos,
    urlListadoRecibosPendientes,
    urlListadoRecibosVencidos,
} from "../dominio_recibos_cobro.ts";

describe("widget recibos de cobro", () => {
    test("pendientes: solo emitidos", () => {
        expect(filtroRecibosPendientesCobro()).toEqual([
            ["estado", "eq", "Emitido"],
        ]);
    });

    test("vencidos: emitidos con fecha anterior a hoy", () => {
        const hoy = new Date("2026-10-07T12:00:00");
        expect(filtroRecibosVencidos(hoy)).toEqual([
            ["estado", "eq", "Emitido"],
            ["fecha_vencimiento", "lt", "2026-10-07"],
        ]);
    });

    test("urls de listado incluyen criterios", () => {
        expect(urlListadoRecibosPendientes()).toMatch(
            /\/tesoreria\/recibo_venta\?.*estado.*Emitido/
        );
        expect(urlListadoRecibosVencidos(new Date("2026-01-15"))).toContain(
            "fecha_vencimiento"
        );
    });
});
