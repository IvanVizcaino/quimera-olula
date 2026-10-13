import { describe, expect, test, vi } from "vitest";

const { patch } = vi.hoisted(() => ({
    patch: vi.fn(),
}));

vi.mock("@olula/lib/api/rest_api.js", () => ({
    RestAPI: { patch },
}));

import {
    asientoDesdeApi,
    itemAsientoDesdeApi,
    partidaAsientoDesdeApi,
    patchRenumerarAsientos,
    resultadoRenumeracionAsientosDesdeApi,
} from "../infraestructura.ts";

describe("mappers asiento API", () => {
    test("itemAsientoDesdeApi mapea cabecera y manual", () => {
        const item = itemAsientoDesdeApi({
            id: 99,
            numero: 12,
            ejercicio_id: "2026",
            fecha: "2026-03-01",
            concepto: "Ajuste",
            importe: 150.5,
            manual: true,
        });

        expect(item.id).toBe("99");
        expect(item.numero).toBe(12);
        expect(item.ejercicioId).toBe("2026");
        expect(item.manual).toBe(true);
        expect(item.fecha.getFullYear()).toBe(2026);
    });

    test("asientoDesdeApi incluye partidas", () => {
        const asiento = asientoDesdeApi({
            id: 1,
            numero: 1,
            ejercicio_id: "2026",
            fecha: "2026-01-15",
            concepto: "Test",
            importe: 200,
            manual: false,
            partidas: [
                {
                    id: 10,
                    asiento_id: 1,
                    subcuenta_id: 430000001,
                    codigo_subcuenta: "430000001",
                    debe: 200,
                    haber: 0,
                    concepto: "Cliente",
                },
            ],
        });

        expect(asiento.partidas).toHaveLength(1);
        expect(asiento.partidas[0].codigoSubcuenta).toBe("430000001");
        expect(
            partidaAsientoDesdeApi({
                id: 10,
                asiento_id: 1,
                subcuenta_id: 572,
                codigo_subcuenta: "572",
                debe: 0,
                haber: 200,
                concepto: "",
            }).haber
        ).toBe(200);
    });
});

describe("renumerar asientos infraestructura (CF-01)", () => {
    test("resultadoRenumeracionAsientosDesdeApi mapea respuesta", () => {
        const r = resultadoRenumeracionAsientosDesdeApi({
            ejercicio_id: "2026",
            total_asientos: 8709,
            asientos_renumerados: 8709,
            ultimo_numero: 8709,
            siguiente_secuencia: 8710,
            modo: "ejercicio_completo",
        });
        expect(r.ejercicioId).toBe("2026");
        expect(r.asientosRenumerados).toBe(8709);
        expect(r.siguienteSecuencia).toBe(8710);
    });

    test("patchRenumerarAsientos llama PATCH renumerar con ejercicio_id", async () => {
        patch.mockResolvedValueOnce({
            ejercicio_id: "2026",
            total_asientos: 10,
            asientos_renumerados: 10,
            ultimo_numero: 10,
            siguiente_secuencia: 11,
            modo: "ejercicio_completo",
        });

        const r = await patchRenumerarAsientos({ ejercicioId: "2026" });

        expect(patch).toHaveBeenCalledWith(
            "/contabilidad/asiento/renumerar",
            { ejercicio_id: "2026" },
            "Error al renumerar asientos"
        );
        expect(r.modo).toBe("ejercicio_completo");
    });
});
