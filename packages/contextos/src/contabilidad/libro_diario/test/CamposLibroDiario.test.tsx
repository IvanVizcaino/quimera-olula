import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { CamposLibroDiario } from "../detalle/CamposLibroDiario.tsx";
import { nuevoLibroDiarioInicial } from "../dominio.ts";

const informe = nuevoLibroDiarioInicial("2026");
// uiProps marca como «texto» los campos sin tipo en la meta, como el de verdad.
const uiProps = (campo: string) => ({
    nombre: campo,
    valor: String(informe[campo] ?? ""),
    tipo: "texto" as const,
    onChange: () => {},
});

const pintar = (cambios: Partial<typeof informe> = {}) =>
    render(
        <quimera-formulario>
            <CamposLibroDiario uiProps={uiProps as never} informe={{ ...informe, ...cambios }} />
        </quimera-formulario>
    );

const nombresPorFila = () =>
    [...document.querySelectorAll(".FilaFormulario")].map((fila) =>
        [...fila.querySelectorAll("[nombre]")].map((c) => c.getAttribute("nombre"))
    );

describe("CamposLibroDiario — criterios del libro diario", () => {
    test("las fechas son controles de fecha con el valor ISO", () => {
        pintar();

        const desde = document.querySelector<HTMLInputElement>('input[name="fechaDesde"]');
        expect(desde?.type).toBe("date");
        expect(desde?.value).toBe("2026-01-01");
        expect(document.querySelector<HTMLInputElement>('input[name="fechaHasta"]')?.type)
            .toBe("date");
    });

    test("cada grupo de campos va en su fila, con los tres niveles de orden", () => {
        pintar();

        const filas = nombresPorFila().map((f) => f.filter((n, i, l) => l.indexOf(n) === i));
        expect(filas).toEqual([
            ["ejercicioId", "fechaDesde", "fechaHasta"],
            ["todosAsientos", "asientoDesde", "asientoHasta"],
            ["todasSubcuentas", "subcuentaDesde", "subcuentaHasta"],
            ["resumenMensual", "datosIva", "agruparMeses"],
            ["orden1", "tipoOrden1"],
            ["orden2", "tipoOrden2"],
            ["orden3", "tipoOrden3"],
        ]);
    });

    test("con resumen mensual, datos de I.V.A. y agrupar por meses no se editan", () => {
        pintar({ resumenMensual: true });

        expect(document.querySelector('input[name="datosIva"]')).toBeNull();
        expect(document.querySelector('input[name="agruparMeses"]')).toBeNull();
    });
});
