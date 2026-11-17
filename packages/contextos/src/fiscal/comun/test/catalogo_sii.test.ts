import { describe, expect, it } from "vitest";
import { filtrarCatalogo, opcion } from "../catalogo_sii.ts";

const tipos = [
    { id: "E1", descripcion: "E1 - Sujeta Exenta Art.20" },
    { id: "S1", descripcion: "S1 - Sujeta No Exenta" },
    { id: "N1", descripcion: "N1 - No Sujeta Artículo 7, 14, Otros" },
];

describe("Catálogos del SII", () => {
    it("sin texto devuelve todo", () => {
        expect(filtrarCatalogo(tipos, "")).toHaveLength(3);
    });
    it("busca por código y por descripción sin tildes ni mayúsculas", () => {
        expect(filtrarCatalogo(tipos, "s1").map((t) => t.id)).toEqual(["S1"]);
        expect(filtrarCatalogo(tipos, "articulo").map((t) => t.id)).toEqual(["N1"]);
        expect(filtrarCatalogo(tipos, "exenta").map((t) => t.id)).toEqual(["E1", "S1"]);
    });
    it("la opción muestra código y descripción y guarda el código", () => {
        expect(opcion({ id: "01", descripcion: "GENERAL" })).toEqual({ valor: "01", descripcion: "01 — GENERAL" });
        expect(opcion(tipos[1]).descripcion).toBe("S1 - Sujeta No Exenta");
    });
});
