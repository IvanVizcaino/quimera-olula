import { describe, expect, test } from "vitest";
import { cambiosProvincia, etiquetaProvincia, provinciaVacio } from "../dominio.ts";
import { cambiosProvinciaAApi, provinciaDesdeApi } from "../infraestructura.ts";

describe("provincias (provincias)", () => {
    test("provinciaDesdeApi pasa el id a texto", () => {
        const provincia = provinciaDesdeApi({ id: 28, nombre: "Madrid", pais_id: "ES", codigo: null, nombre_pais: "España" });
        expect(provincia).toMatchObject({ id: "28", codigo: "", nombrePais: "España" });
        expect(etiquetaProvincia(provincia)).toBe("Madrid");
    });

    test("cambios a la API y detección de lo editado", () => {
        expect(cambiosProvinciaAApi({ codigo: " ", nombre: " Madrid " })).toEqual({ codigo: null, nombre: "Madrid" });
        const previa = { ...provinciaVacio(), id: "1", nombre: "A" };
        expect(cambiosProvincia(previa, { ...previa, codigo: "28" })).toEqual({ codigo: "28" });
    });
});
