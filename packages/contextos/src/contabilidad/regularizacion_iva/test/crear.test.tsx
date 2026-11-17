import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { getSubcuentasRegularizacionIva, postRegularizacionIva } = vi.hoisted(() => ({
    getSubcuentasRegularizacionIva: vi.fn(),
    postRegularizacionIva: vi.fn(),
}));

vi.mock("../infraestructura.ts", () => ({
    getSubcuentasRegularizacionIva,
    postRegularizacionIva,
}));

vi.mock("#/contabilidad/asiento/dominio.ts", () => ({
    ejercicioActual: () => "2026",
}));

const { CrearRegularizacionIva } = await import("../crear/CrearRegularizacionIva.tsx");

const valorCampo = (etiqueta: string, nombre: string) =>
    (document.querySelector(`${etiqueta}[nombre="${nombre}"] input`) as HTMLInputElement | null)
        ?.value;

describe("alta de regularización de IVA", () => {
    beforeEach(() => {
        getSubcuentasRegularizacionIva.mockReset();
        postRegularizacionIva.mockReset();
    });

    test("propone las subcuentas H.P. del ejercicio", async () => {
        getSubcuentasRegularizacionIva.mockResolvedValue({
            codigoSubcuentaDeudora: "4700000000",
            codigoSubcuentaAcreedora: "4750000000",
        });

        render(<CrearRegularizacionIva publicar={vi.fn()} regularizaciones={[]} />);

        expect(getSubcuentasRegularizacionIva).toHaveBeenCalledWith("2026");
        await waitFor(() =>
            expect(valorCampo("quimera-input", "codigoSubcuentaDeudora")).toBe("4700000000")
        );
        expect(valorCampo("quimera-input", "codigoSubcuentaAcreedora")).toBe("4750000000");
    });

    test("muestra las fechas desde y hasta del periodo propuesto", () => {
        getSubcuentasRegularizacionIva.mockReturnValue(new Promise(() => {}));

        render(<CrearRegularizacionIva publicar={vi.fn()} regularizaciones={[]} />);

        expect(valorCampo("quimera-date", "fechaInicio")).toBe("2026-01-01");
        expect(valorCampo("quimera-date", "fechaFin")).toBe("2026-03-31");
    });
});
