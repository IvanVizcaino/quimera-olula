import { describe, expect, test } from "vitest";
import {
    criteriaExtremo,
    ExtremosEjercicio,
    rangosRellenados,
    rangosSincronizados,
    SIN_EXTREMOS,
    subcuentasRequeridas,
} from "../rangos_ejercicio.ts";

const extremos: ExtremosEjercicio = {
    asientos: ["1", "4820"],
    subcuentas: ["1000000000", "7790000000"],
};

const formulario = (campos: Record<string, unknown> = {}) => ({
    ejercicioId: "2026",
    todosAsientos: true,
    asientoDesde: "",
    asientoHasta: "",
    todasSubcuentas: true,
    subcuentaDesde: "",
    subcuentaHasta: "",
    ...campos,
});

describe("criteriaExtremo", () => {
    test("pide una sola fila del ejercicio ordenada por el campo", () => {
        expect(criteriaExtremo("numero", "2026", "DESC")).toEqual({
            filtro: [["ejercicio_id", "=", "2026"]],
            orden: ["numero", "DESC"],
            paginacion: { limite: 1, pagina: 1 },
        });
    });
});

describe("rangosRellenados", () => {
    test("con las casillas marcadas pone el primero y el último del ejercicio", () => {
        expect(rangosRellenados(formulario(), extremos)).toEqual(
            formulario({
                asientoDesde: "1",
                asientoHasta: "4820",
                subcuentaDesde: "1000000000",
                subcuentaHasta: "7790000000",
            })
        );
    });

    test("con las casillas desmarcadas respeta lo que haya escrito", () => {
        const modelo = formulario({
            todosAsientos: false,
            asientoDesde: "10",
            asientoHasta: "20",
            todasSubcuentas: false,
            subcuentaDesde: "4300000000",
            subcuentaHasta: "4309999999",
        });
        expect(rangosRellenados(modelo, extremos)).toBe(modelo);
    });

    test("sin extremos (ejercicio sin asientos o aún cargando) no toca nada", () => {
        const modelo = formulario();
        expect(rangosRellenados(modelo, SIN_EXTREMOS)).toBe(modelo);
    });

    test("devuelve el mismo objeto si ya estaba relleno", () => {
        const modelo = formulario({
            asientoDesde: "1",
            asientoHasta: "4820",
            subcuentaDesde: "1000000000",
            subcuentaHasta: "7790000000",
        });
        expect(rangosRellenados(modelo, extremos)).toBe(modelo);
    });

    test("el libro mayor, sin asientos, solo rellena las subcuentas", () => {
        const mayor = {
            todasSubcuentas: true,
            subcuentaDesde: "",
            subcuentaHasta: "",
        };
        expect(rangosRellenados(mayor, extremos)).toEqual({
            todasSubcuentas: true,
            subcuentaDesde: "1000000000",
            subcuentaHasta: "7790000000",
        });
    });

    test("acepta las casillas aún como texto", () => {
        const modelo = formulario({ todosAsientos: "true", todasSubcuentas: "false" });
        const resultado = rangosRellenados(modelo, extremos);
        expect(resultado.asientoDesde).toBe("1");
        expect(resultado.subcuentaDesde).toBe("");
    });
});

describe("rangosSincronizados", () => {
    test("al desmarcar todas las subcuentas vacía los códigos", () => {
        const modelo = formulario({
            todasSubcuentas: false,
            subcuentaDesde: "1000000000",
            subcuentaHasta: "7790000000",
            asientoDesde: "1",
            asientoHasta: "4820",
        });
        const resultado = rangosSincronizados(modelo, true, extremos);
        expect(resultado.subcuentaDesde).toBe("");
        expect(resultado.subcuentaHasta).toBe("");
    });

    test("al desmarcar todos los asientos conserva los números", () => {
        const modelo = formulario({
            todosAsientos: false,
            asientoDesde: "1",
            asientoHasta: "4820",
            subcuentaDesde: "1000000000",
            subcuentaHasta: "7790000000",
        });
        expect(rangosSincronizados(modelo, true, extremos)).toBe(modelo);
    });

    test("si ya estaban desmarcadas no borra lo que escribe el usuario", () => {
        const modelo = formulario({
            todosAsientos: false,
            todasSubcuentas: false,
            subcuentaDesde: "4300000000",
            subcuentaHasta: "",
        });
        expect(rangosSincronizados(modelo, false, extremos)).toBe(modelo);
    });

    test("al marcar rellena con los extremos", () => {
        const modelo = formulario({ subcuentaDesde: "", subcuentaHasta: "" });
        const resultado = rangosSincronizados(modelo, false, extremos);
        expect(resultado.subcuentaDesde).toBe("1000000000");
        expect(resultado.subcuentaHasta).toBe("7790000000");
    });
});

describe("subcuentasRequeridas", () => {
    test("solo sin «todas las subcuentas»", () => {
        expect(subcuentasRequeridas({ todasSubcuentas: true })).toBe(false);
        expect(subcuentasRequeridas({ todasSubcuentas: false })).toBe(true);
    });
});
