import { describe, expect, it } from "vitest";
import {
    cambiarDebeMe,
    cambiarDivisa,
    cambiarDivisaEnPartidas,
    cambiarHaberMe,
    cambiarTasa,
    divisaParaNuevaPartida,
    esDivisaExtranjera,
    textoAImporte,
} from "../divisa_partida.ts";
import { partidaManualVacia } from "../dominio.ts";

const divisas = [
    { id: "EUR", descripcion: "Euro", tasa: 1 },
    { id: "USD", descripcion: "Dólar", tasa: 0.92 },
];

describe("Partidas en divisa (co_partidas.qs)", () => {
    it("sin divisa, la partida va en la de la empresa", () => {
        expect(esDivisaExtranjera(partidaManualVacia(), "EUR")).toBe(false);
    });

    it("al cambiar a otra divisa toma su tasa y pone los importes a cero", () => {
        const p = cambiarDivisa({ ...partidaManualVacia(), debe: 50 }, "USD", "EUR", divisas);
        expect(p).toMatchObject({ divisaId: "USD", tasaConversion: 0.92, debe: 0, haber: 0, debeMe: 0, haberMe: 0 });
        expect(esDivisaExtranjera(p, "EUR")).toBe(true);
    });

    it("volver a la divisa de la empresa deja la tasa a 1", () => {
        const usd = cambiarDivisa(partidaManualVacia(), "USD", "EUR", divisas);
        expect(cambiarDivisa(usd, "EUR", "EUR", divisas)).toMatchObject({ divisaId: "EUR", tasaConversion: 1 });
    });

    it("debe y haber salen de los importes en moneda extranjera por la tasa", () => {
        const usd = cambiarDivisa(partidaManualVacia(), "USD", "EUR", divisas);
        const conDebe = cambiarDebeMe(usd, 150);
        expect(conDebe).toMatchObject({ debeMe: 150, debe: 138, haber: 0 });
        const conHaber = cambiarHaberMe(conDebe, 10.01);
        expect(conHaber).toMatchObject({ haberMe: 10.01, haber: 9.21, debeMe: 0, debe: 0 });
        expect(cambiarTasa(conHaber, 2)).toMatchObject({ haber: 20.02 });
    });

    it("una partida nueva sigue en la divisa de la anterior", () => {
        const usd = cambiarDivisa(partidaManualVacia(), "USD", "EUR", divisas);
        expect(divisaParaNuevaPartida([partidaManualVacia(), usd])).toEqual({ divisaId: "USD", tasaConversion: 0.92 });
        // Aunque la última partida no se haya tocado: manda la última en que se eligió.
        expect(divisaParaNuevaPartida([usd, partidaManualVacia()])).toEqual({ divisaId: "USD", tasaConversion: 0.92 });
        expect(divisaParaNuevaPartida([partidaManualVacia()])).toEqual({});
    });

    it("los importes admiten coma o punto decimal", () => {
        expect(textoAImporte("12,75")).toBe(12.75);
        expect(textoAImporte("100.25")).toBe(100.25);
        expect(textoAImporte("1.234,5")).toBe(1234.5);
        expect(textoAImporte("84,")).toBe(84);
        expect(textoAImporte("")).toBe(0);
        expect(textoAImporte("-")).toBeNull();
        expect(textoAImporte("abc")).toBeNull();
    });

    it("al cambiar la divisa, las partidas siguientes vacías toman la misma", () => {
        const conDatos = { ...partidaManualVacia(), subcuentaId: 7, haber: 10 };
        const r = cambiarDivisaEnPartidas(
            [partidaManualVacia(), partidaManualVacia(), conDatos, partidaManualVacia()], 0, "USD", "EUR", divisas);
        expect(r.map((p) => p.divisaId)).toEqual(["USD", "USD", undefined, "USD"]);
        expect(r[1].tasaConversion).toBe(0.92);
        expect(r[2]).toBe(conDatos);
        // Las anteriores no se tocan.
        const desdeLaSegunda = cambiarDivisaEnPartidas([partidaManualVacia(), partidaManualVacia()], 1, "USD", "EUR", divisas);
        expect(desdeLaSegunda.map((p) => p.divisaId)).toEqual([undefined, "USD"]);
    });
});
