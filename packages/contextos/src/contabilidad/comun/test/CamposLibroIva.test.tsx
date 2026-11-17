import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { CamposLibroIva } from "../componentes/CamposLibroIva.tsx";

const valores: Record<string, string> = {
    ejercicioId: "2026",
    fechaDesde: "2026-01-01",
    fechaHasta: "2026-12-31",
    porcentaje: "21",
};
// uiProps marca como «texto» los campos sin tipo en la meta, como el de verdad.
const uiProps = (campo: string) => ({
    nombre: campo,
    valor: valores[campo] ?? "",
    tipo: "texto" as const,
    onChange: () => {},
});

const pintar = (conSerie: boolean, porcentajeEditable = true) =>
    render(
        <quimera-formulario>
            <CamposLibroIva
                uiProps={uiProps as never}
                porcentajeEditable={porcentajeEditable}
                numeroDesdeEditable={false}
                conSerie={conSerie}
            />
        </quimera-formulario>
    );

const filas = () =>
    [...document.querySelectorAll(".FilaFormulario")].map((fila) => [
        ...new Set([...fila.querySelectorAll("[nombre]")].map((c) => c.getAttribute("nombre"))),
    ]);

describe("CamposLibroIva — criterios de los libros de facturas", () => {
    test("emitidas: fechas como control de fecha y cada grupo en su fila", () => {
        pintar(false);

        const desde = document.querySelector<HTMLInputElement>('input[name="fechaDesde"]');
        expect(desde?.type).toBe("date");
        expect(desde?.value).toBe("2026-01-01");
        expect(filas()).toEqual([
            ["ejercicioId", "fechaDesde", "fechaHasta"],
            ["todos", "porcentaje"],
            ["conIva", "mostrarTotalFactura", "mostrarNif", "mostrarDocumento", "mostrarAsiento"],
            ["numeracionAutomatica", "numeroDesde"],
        ]);
    });

    test("recibidas: la serie va en la fila del I.V.A.", () => {
        pintar(true);

        expect(filas()[1]).toEqual(["codigoSerie", "todos", "porcentaje"]);
    });

    test("el % de I.V.A. y el número inicial bloqueados no se editan", () => {
        pintar(false, false);

        expect(document.querySelector('input[name="porcentaje"]')).toBeNull();
        expect(document.querySelector('input[name="numeroDesde"]')).toBeNull();
    });
});
