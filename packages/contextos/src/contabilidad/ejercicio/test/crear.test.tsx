import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { CrearEjercicio } from "../crear/CrearEjercicio.tsx";
import { Ejercicio } from "../diseño.ts";
import { ejercicioVacio } from "../dominio.ts";

const ejercicio = (id: string, anyo: number, cambios: Partial<Ejercicio> = {}): Ejercicio => ({
    ...ejercicioVacio(), id, nombre: `EJERCICIO ${id}`, tienePgc: true, digitosSubcuenta: 8,
    fechaInicio: new Date(anyo, 0, 1, 12), fechaFin: new Date(anyo, 11, 31, 12), ...cambios,
});

const filaDe = (texto: string) =>
    screen.getByText(texto, { selector: ".etiqueta" }).closest(".FilaFormulario");

describe("alta de ejercicio fiscal (B3)", () => {
    test("Código y Nombre en una fila; Inicio, Fin y Dígitos de subcuenta en otra", () => {
        render(<CrearEjercicio publicar={vi.fn()} ejercicios={[ejercicio("2026", 2026)]} />);
        const filaCodigo = filaDe("Código");
        expect(filaCodigo).not.toBeNull();
        expect(filaCodigo).toBe(filaDe("Nombre"));
        const filaFechas = filaDe("Inicio");
        expect(filaFechas).not.toBeNull();
        expect(filaFechas).toBe(filaDe("Fin"));
        expect(filaFechas).toBe(filaDe("Dígitos de subcuenta"));
        expect(screen.getByText("Plan contable", { selector: ".etiqueta" })).toBeInTheDocument();
        expect(screen.getByText("Series (separadas por comas)", { selector: ".etiqueta" })).toBeInTheDocument();
    });

    test("al copiar el plan de otro ejercicio los dígitos son los suyos y no se editan", () => {
        render(<CrearEjercicio publicar={vi.fn()} ejercicios={[ejercicio("2026", 2026)]} />);
        const digitos = filaDe("Dígitos de subcuenta")?.querySelector("quimera-input[nombre='digitosSubcuenta']");
        expect(digitos?.textContent ?? "").toContain("8");
    });
});
