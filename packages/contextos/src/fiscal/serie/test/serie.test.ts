import { describe, expect, test, vi } from "vitest";

vi.mock("#/contabilidad/asiento/dominio.ts", () => ({ ejercicioActual: () => "2026" }));

const { cambiosSerieAApi, metaNuevaSerie, nuevaSerieAApi, serieDesdeApi } = await import("../dominio.ts");

const api = {
    id: "A", descripcion: "SERIE A", irpf: 0, sin_iva: false,
    codigo_cuenta: null, descripcion_cuenta: null, codigo_subcuenta: "7000000000",
    descripcion_subcuenta: "Ventas", rectificativa: false, simplificada: false,
};

describe("series (series.mtd)", () => {
    test("serieDesdeApi convierte nulos en vacío", () => {
        const serie = serieDesdeApi(api);
        expect(serie.codigoCuenta).toBe("");
        expect(serie.descripcionSubcuenta).toBe("Ventas");
    });

    test("cambios: solo lo cambiado, con el ejercicio actual", () => {
        const serie = serieDesdeApi(api);
        expect(cambiosSerieAApi(serie, { ...serie, irpf: 15, simplificada: true }))
            .toEqual({ irpf: 15, simplificada: true, ejercicio_id: "2026" });
        expect(cambiosSerieAApi(serie, serie)).toEqual({});
    });

    test("alta en mayúsculas", () => {
        const nueva = { ...serieDesdeApi(api), id: "b" };
        expect(nuevaSerieAApi(nueva)).toMatchObject({ id: "B", descripcion: "SERIE A", ejercicio_id: "2026" });
    });

    test("cuenta o subcuenta, no las dos", () => {
        const nueva = { ...serieDesdeApi(api), id: "B", codigoCuenta: "700" };
        expect(metaNuevaSerie.validacion!(nueva)).toContain("no las dos");
    });

    test("campo vaciado (null) no rompe la validación", () => {
        const nueva = { ...serieDesdeApi(api), id: "B", codigoCuenta: null as unknown as string };
        expect(metaNuevaSerie.validacion!(nueva)).toBe(true);
    });
});
