import { describe, expect, test } from "vitest";
import {
    ejercicioPrevio,
    esFilaSaldo,
    etiquetaPatrimonioNeto,
    importePatrimonioNeto,
    nombreFicheroPatrimonioNeto,
    nuevoPatrimonioNetoInicial,
} from "../dominio.ts";
import { cambiosDeInforme } from "../detalle/detalle.ts";
import { PatrimonioNeto } from "../diseño.ts";

const ficha: PatrimonioNeto = {
    id: "3",
    descripcion: "ECPN 2026",
    ejercicioId: "2026",
    ejercicioAnteriorId: "2025",
    ejercicioAnteriorAnteriorId: "",
};

describe("dominio del estado de cambios en el patrimonio neto", () => {
    test("el alta propone el año anterior como X-1", () => {
        const nuevo = nuevoPatrimonioNetoInicial("2026");
        expect(nuevo.ejercicioId).toBe("2026");
        expect(nuevo.ejercicioAnteriorId).toBe("2025");
        expect(nuevo.ejercicioAnteriorAnteriorId).toBe("");
    });

    test("un código de ejercicio que no es un año no propone anterior", () => {
        expect(ejercicioPrevio("EJ26")).toBe("");
    });

    test("las celdas a cero salen en blanco, como en Eneboo", () => {
        expect(importePatrimonioNeto(0)).toBe("");
        expect(importePatrimonioNeto(1234.5)).toMatch(/1\.?234,50/);
    });

    test("las filas de saldo se distinguen", () => {
        expect(esFilaSaldo({ clave: "saldo_final" })).toBe(true);
        expect(esFilaSaldo({ clave: "aumentos_capital" })).toBe(false);
    });

    test("etiqueta y nombre de fichero", () => {
        expect(etiquetaPatrimonioNeto(ficha)).toBe("ECPN 2026 — 2026");
        expect(nombreFicheroPatrimonioNeto(ficha, "pdf")).toBe("ecpn-2026.pdf");
        expect(
            nombreFicheroPatrimonioNeto({ ...ficha, descripcion: "" }, "xlsx")
        ).toBe("patrimonio-neto-2026.xlsx");
    });

    test("solo se mandan los campos cambiados", () => {
        const cambios = cambiosDeInforme(ficha, {
            ...ficha,
            ejercicioAnteriorId: "",
        });
        expect(cambios).toEqual({ ejercicioAnteriorId: "" });
    });
});
