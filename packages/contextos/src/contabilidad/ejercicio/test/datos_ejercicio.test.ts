import { describe, expect, test } from "vitest";
import { cambiosDatosEjercicio, metaDatosEjercicio } from "../dominio.ts";
import { serieEjercicioDesdeApi } from "../infraestructura.ts";

const datos = {
    nombre: "EJERCICIO 2026",
    fechaInicio: new Date(2026, 0, 1, 12),
    fechaFin: new Date(2026, 11, 31, 12),
    digitosSubcuenta: 10,
};

describe("cabecera del ejercicio fiscal (ejercicios.ui)", () => {
    test("solo manda lo que cambia", () => {
        expect(cambiosDatosEjercicio(datos, { ...datos, nombre: " 2026 bis " })).toEqual({ nombre: "2026 bis" });
        expect(cambiosDatosEjercicio(datos, { ...datos, fechaFin: new Date(2026, 11, 30, 12) }))
            .toEqual({ fechaFin: new Date(2026, 11, 30, 12) });
        expect(cambiosDatosEjercicio(datos, { ...datos, fechaInicio: new Date(2026, 0, 1, 8) })).toEqual({});
    });

    test("valida fechas y longitud de subcuenta como ejercicios.qs", () => {
        const validar = metaDatosEjercicio.validacion!;
        expect(validar({ ...datos, fechaInicio: new Date(2027, 0, 1) })).toContain("fecha de inicio");
        expect(validar({ ...datos, digitosSubcuenta: 4 })).toContain("entre 5 y 15");
        expect(validar(datos)).toBe(true);
    });

    test("serieEjercicioDesdeApi", () => {
        expect(serieEjercicioDesdeApi({ id: 7, serie_id: "A", descripcion: null }))
            .toEqual({ id: "7", serieId: "A", descripcion: "" });
    });
});
