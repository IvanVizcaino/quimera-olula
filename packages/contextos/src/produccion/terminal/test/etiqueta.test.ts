import { describe, expect, it } from "vitest";
import { nombreEtiquetaTarea, preguntarEtiqueta } from "../dominio.ts";
import { urlEtiquetaTarea } from "../infraestructura.ts";

describe("Terminal: etiqueta de la tarea", () => {
    it("se pregunta solo en la tarea final y cuando se ha declarado algo", () => {
        const final = { final: true };
        expect(preguntarEtiqueta(final, "terminar")).toBe(true);
        expect(preguntarEtiqueta(final, "pausar")).toBe(true);
        expect(preguntarEtiqueta(final, "terminada_en_un_paso")).toBe(true);
        expect(preguntarEtiqueta(final, "iniciada")).toBe(false);
        expect(preguntarEtiqueta(final, "guardar")).toBe(false);
        expect(preguntarEtiqueta({ final: false }, "terminar")).toBe(false);
    });

    it("URL y nombre", () => {
        expect(urlEtiquetaTarea("TA000003", { copias: 1, formato: "3x9", cantidad: null }))
            .toBe("/produccion/terminal/tarea/TA000003/etiqueta?copias=1&formato=3x9");
        expect(urlEtiquetaTarea("TA000003", { copias: 4, formato: "3x9", cantidad: 5 }))
            .toBe("/produccion/terminal/tarea/TA000003/etiqueta?copias=4&formato=3x9&cantidad=5");
        expect(nombreEtiquetaTarea("TA000003")).toBe("etiqueta-TA000003.pdf");
    });
});
