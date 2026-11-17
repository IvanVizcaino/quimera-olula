import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { CamposCuentasAnuales } from "../detalle/CamposCuentasAnuales.tsx";
import { NuevaCuentasAnuales } from "../diseño.ts";
import { nuevaCuentasAnualesInicial } from "../dominio.ts";

const informe: NuevaCuentasAnuales = {
    ...nuevaCuentasAnualesInicial("2026"),
    fechaDesdeAnterior: "2025-01-01",
};
// uiProps marca como «texto» los campos sin tipo en la meta, como el de verdad.
const uiProps = (campo: string) => ({
    nombre: campo,
    valor: String(informe[campo] ?? ""),
    tipo: "texto" as const,
    onChange: () => {},
});

const filas = () =>
    [...document.querySelectorAll(".FilaFormulario")].map((fila) => [
        ...new Set([...fila.querySelectorAll("[nombre]")].map((c) => c.getAttribute("nombre"))),
    ]);

describe("CamposCuentasAnuales — criterios de las cuentas anuales", () => {
    test("las cuatro fechas son controles de fecha y cada grupo va en su fila", () => {
        render(
            <quimera-formulario>
                <CamposCuentasAnuales uiProps={uiProps as never} informe={informe} />
            </quimera-formulario>
        );

        for (const nombre of ["fechaDesde", "fechaHasta", "fechaDesdeAnterior", "fechaHastaAnterior"]) {
            expect(document.querySelector<HTMLInputElement>(`input[name="${nombre}"]`)?.type)
                .toBe("date");
        }
        expect(document.querySelector<HTMLInputElement>('input[name="fechaDesdeAnterior"]')?.value)
            .toBe("2025-01-01");
        expect(filas()).toEqual([
            ["tipo", "formato", "nivelDesglose"],
            ["ejercicioId", "fechaDesde", "fechaHasta"],
            ["ejercicioAnteriorId", "fechaDesdeAnterior", "fechaHastaAnterior"],
        ]);
        expect(document.querySelector('[nombre="omitirEpigrafesSinSaldo"]')).toBeNull();
    });

    test("la ficha conserva la casilla de omitir epígrafes sin saldo", () => {
        render(
            <quimera-formulario>
                <CamposCuentasAnuales uiProps={uiProps as never} informe={informe} conOmitirEpigrafes />
            </quimera-formulario>
        );

        expect(document.querySelector('[nombre="omitirEpigrafesSinSaldo"]')).not.toBeNull();
    });
});
