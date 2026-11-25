import { describe, expect, it } from "vitest";
import { nuevoCentroCosteVacio, validarCentroCoste } from "../dominio.ts";
import { cambiosCentroCosteAApi, centroCosteDesdeApi } from "../infraestructura.ts";

describe("centros de coste", () => {
    it("exige código, descripción y tipo de centro", () => {
        const valido = { ...nuevoCentroCosteVacio, id: "C1", descripcion: "Prensa", tipoCentroId: "MAQ" };
        expect(validarCentroCoste(valido)).toBe(true);
        expect(validarCentroCoste({ ...valido, tipoCentroId: "" })).toBe("El tipo de centro es obligatorio");
        expect(validarCentroCoste({ ...valido, id: "x".repeat(26) })).not.toBe(true);
    });

    it("convierte desde y hacia la API", () => {
        expect(centroCosteDesdeApi({ id: "C1", descripcion: "Prensa", tipo_centro_id: "MAQ", tipo_centro: "Máquinas" }))
            .toEqual({ id: "C1", descripcion: "Prensa", tipoCentroId: "MAQ", tipoCentro: "Máquinas" });
        expect(cambiosCentroCosteAApi({ tipoCentroId: "MO" })).toEqual({ tipo_centro_id: "MO" });
    });
});
