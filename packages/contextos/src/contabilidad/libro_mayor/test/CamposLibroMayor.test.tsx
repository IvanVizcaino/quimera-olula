import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { CamposLibroMayor } from "../detalle/CamposLibroMayor.tsx";
import { nuevoLibroMayorInicial } from "../dominio.ts";

const informe = nuevoLibroMayorInicial("2026");
// uiProps marca como «texto» los campos sin tipo en la meta, como el de verdad.
const uiProps = (campo: string) => ({
    nombre: campo,
    valor: String(informe[campo] ?? ""),
    tipo: "texto" as const,
    onChange: () => {},
});

describe("CamposLibroMayor — criterios del libro mayor", () => {
    test("fechas como control de fecha y cada grupo en su fila", () => {
        render(
            <quimera-formulario>
                <CamposLibroMayor uiProps={uiProps as never} informe={informe} />
            </quimera-formulario>
        );

        const desde = document.querySelector<HTMLInputElement>('input[name="fechaDesde"]');
        expect(desde?.type).toBe("date");
        expect(desde?.value).toBe("2026-01-01");

        const filas = [...document.querySelectorAll(".FilaFormulario")].map((fila) => [
            ...new Set([...fila.querySelectorAll("[nombre]")].map((c) => c.getAttribute("nombre"))),
        ]);
        expect(filas).toEqual([
            ["ejercicioId", "fechaDesde", "fechaHasta"],
            ["todasSubcuentas", "subcuentaDesde", "subcuentaHasta"],
            ["saldoInicial", "excluirPartidasCero"],
            ["orden", "tipoOrden"],
        ]);
    });
});
