import { describe, expect, test } from "vitest";
import {
    filtroIvaVacio,
    metaFormularioLibroIva,
    porcentajeRequerido,
    porcentajeSegunTodos,
    presentacionIvaVacia,
} from "../librosIva.ts";

const ficha = (campos: Record<string, unknown> = {}) => ({
    descripcion: "IVA 2026",
    ejercicioId: "2026",
    fechaDesde: "2026-01-01",
    fechaHasta: "2026-12-31",
    ...filtroIvaVacio(),
    ...presentacionIvaVacia(),
    ...campos,
});

describe("formulario de los libros de I.V.A.", () => {
    const meta = metaFormularioLibroIva<ReturnType<typeof ficha>>();

    test("las opciones booleanas son casillas", () => {
        for (const campo of [
            "todos",
            "conIva",
            "mostrarTotalFactura",
            "mostrarNif",
            "mostrarDocumento",
            "mostrarAsiento",
            "numeracionAutomatica",
        ]) {
            expect(meta.campos?.[campo]?.tipo).toBe("checkbox");
        }
    });

    test("las casillas quedan como booleanos al cambiar", () => {
        const resultado = meta.onChange?.(
            ficha({ mostrarNif: "false", numeracionAutomatica: "true" }),
            "mostrarNif",
            true
        );
        expect(resultado?.mostrarNif).toBe(false);
        expect(resultado?.numeracionAutomatica).toBe(true);
    });
});

describe("% de I.V.A.", () => {
    const meta = metaFormularioLibroIva<ReturnType<typeof ficha>>();

    test("es un número libre con dos decimales", () => {
        expect(meta.campos?.porcentaje?.tipo).toBe("decimal");
        expect(meta.campos?.porcentaje?.decimales).toBe(2);
    });

    test("al marcar todos los tipos pasa a 0", () => {
        const resultado = meta.onChange?.(
            ficha({ todos: "true", porcentaje: 21 }),
            "todos",
            false
        );
        expect(resultado?.todos).toBe(true);
        expect(resultado?.porcentaje).toBe(0);
    });

    test("al desmarcar todos los tipos conserva el porcentaje", () => {
        const resultado = meta.onChange?.(
            ficha({ todos: "false", porcentaje: 0 }),
            "todos",
            true
        );
        expect(resultado?.todos).toBe(false);
        expect(resultado?.porcentaje).toBe(0);
    });

    test("escribir el porcentaje no lo pisa", () => {
        expect(
            porcentajeSegunTodos(ficha({ todos: false, porcentaje: 10 }), "porcentaje")
                .porcentaje
        ).toBe(10);
    });

    test("es obligatorio sin todos los tipos", () => {
        expect(porcentajeRequerido(ficha({ todos: false }))).toBe(true);
        expect(porcentajeRequerido(ficha({ todos: true }))).toBe(false);
    });
});
