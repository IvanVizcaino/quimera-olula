import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { RegularizacionIva } from "../diseño.ts";

const { getRegularizacionIva, getAsiento } = vi.hoisted(() => ({
    getRegularizacionIva: vi.fn(),
    getAsiento: vi.fn(),
}));

vi.mock("../infraestructura.ts", () => ({ getRegularizacionIva }));
vi.mock("#/contabilidad/asiento/infraestructura.ts", () => ({ getAsiento }));

const { DetalleRegularizacionIva } = await import("../detalle/DetalleRegularizacionIva.tsx");

const regularizacion = (): RegularizacionIva => ({
    id: "3",
    ejercicioId: "2026",
    periodo: "T1",
    fechaInicio: new Date(2026, 0, 1, 12),
    fechaFin: new Date(2026, 2, 31, 12),
    fechaAsiento: new Date(2026, 2, 31, 12),
    asientoId: "77",
    numeroAsiento: 12,
    importe: 525.5,
    codigoSubcuentaDeudora: "4700000000",
    codigoSubcuentaAcreedora: "4750000000",
});

const partida = (id: string, codigo: string, debe: number, haber: number) => ({
    id,
    asientoId: "77",
    subcuentaId: Number(id),
    codigoSubcuenta: codigo,
    debe,
    haber,
    concepto: "REGULARIZACIÓN IVA",
});

const campo = (nombre: string) =>
    document.querySelector(`quimera-input[nombre="${nombre}"] .valor-solo-lectura`)
        ?.textContent;

describe("detalle de la regularización de IVA", () => {
    test("muestra los datos, el asiento y la tabla de sus partidas", async () => {
        getRegularizacionIva.mockResolvedValue(regularizacion());
        getAsiento.mockResolvedValue({
            id: "77",
            numero: 12,
            ejercicioId: "2026",
            fecha: new Date(2026, 2, 31, 12),
            concepto: "REGULARIZACIÓN IVA",
            importe: 525.5,
            manual: false,
            tipoDocumento: "",
            documento: "",
            partidas: [
                partida("1", "4770000000", 525.5, 0),
                partida("2", "4720000000", 0, 210),
                partida("3", "4750000000", 0, 315.5),
            ],
        });

        render(<DetalleRegularizacionIva id="3" />);

        expect(await screen.findByText("4770000000")).toBeInTheDocument();
        expect(getAsiento).toHaveBeenCalledWith("77");
        expect(campo("ejercicioId")).toBe("2026");
        expect(campo("periodo")).toBe("T1");
        expect(campo("codigoSubcuentaDeudora")).toBe("4700000000");
        expect(campo("codigoSubcuentaAcreedora")).toBe("4750000000");
        expect(campo("numeroAsiento")).toBe("12");
        expect(campo("fechaInicio")).toBeTruthy();
        expect(campo("fechaFin")).toBeTruthy();
        expect(campo("fechaAsiento")).toBeTruthy();
        // Solo la tabla: el número y la fecha ya están en el formulario.
        expect(document.querySelector(".CabeceraAsiento")).toBeNull();
        expect(screen.getByText("4720000000")).toBeInTheDocument();
    });
});
