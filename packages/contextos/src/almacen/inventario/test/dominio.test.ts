import { describe, expect, test } from "vitest";
import { diferenciaLineaInventario, inventarioEditable } from "../dominio.ts";
import { LineaInventario } from "../diseño.ts";

const lineaBase = (): LineaInventario => ({
    id: "1",
    inventarioId: "INV1",
    stockId: 10,
    referencia: "REF",
    descripcion: "Artículo",
    cantidadIni: 5,
    cantidadFin: 8,
    codlote: null,
});

describe("diferenciaLineaInventario", () => {
    test("calcula recuento menos stock inicial", () => {
        expect(diferenciaLineaInventario(lineaBase())).toBe(3);
    });

    test("admite diferencia negativa", () => {
        expect(diferenciaLineaInventario({ ...lineaBase(), cantidadFin: 2 })).toBe(-3);
    });
});

describe("inventarioEditable", () => {
    test("true si no está cerrado", () => {
        expect(inventarioEditable({ cerrado: false })).toBe(true);
    });

    test("false si está cerrado", () => {
        expect(inventarioEditable({ cerrado: true })).toBe(false);
    });
});
