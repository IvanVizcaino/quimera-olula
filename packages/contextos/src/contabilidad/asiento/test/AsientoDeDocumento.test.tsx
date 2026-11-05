import { Asiento } from "../diseño.ts";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { getAsiento } = vi.hoisted(() => ({ getAsiento: vi.fn() }));

vi.mock("../infraestructura.ts", () => ({ getAsiento }));

const { AsientoDeDocumento } = await import("../vistas/detalle/AsientoDeDocumento.tsx");

const asientoDeFactura = (): Asiento => ({
    id: "128",
    numero: 45,
    ejercicioId: "2026",
    fecha: new Date("2026-03-01T12:00:00"),
    concepto: "Factura de compra 2026/17",
    importe: 121,
    manual: false,
    tipoDocumento: "Factura de proveedor",
    documento: "FRA-17",
    partidas: [
        {
            id: "1",
            asientoId: "128",
            subcuentaId: 11,
            codigoSubcuenta: "6000000",
            debe: 100,
            haber: 0,
            concepto: "Compra",
        },
        {
            id: "2",
            asientoId: "128",
            subcuentaId: 22,
            codigoSubcuenta: "4720000",
            debe: 21,
            haber: 0,
            concepto: "IVA soportado",
        },
        {
            id: "3",
            asientoId: "128",
            subcuentaId: 33,
            codigoSubcuenta: "4000000",
            debe: 0,
            haber: 121,
            concepto: "Proveedor",
        },
    ],
});

describe("AsientoDeDocumento — el asiento de una factura", () => {
    beforeEach(() => {
        getAsiento.mockReset();
    });

    test("avisa de que no está contabilizada y no llama al API", () => {
        render(<AsientoDeDocumento asientoId={null} />);

        expect(screen.getByText(/todavía no está contabilizada/)).toBeInTheDocument();
        expect(getAsiento).not.toHaveBeenCalled();
    });

    test("carga el asiento de la factura y pinta su cabecera", async () => {
        getAsiento.mockResolvedValue(asientoDeFactura());

        render(<AsientoDeDocumento asientoId="128" />);

        expect(getAsiento).toHaveBeenCalledWith("128");
        await screen.findByText("Factura de compra 2026/17");

        // QInput en solo lectura no pinta un <input>, sino un span con el valor.
        const campo = (nombre: string) =>
            document.querySelector(
                `quimera-input[nombre="${nombre}"] .valor-solo-lectura`
            )?.textContent;

        expect(campo("numero")).toBe("45");
        expect(campo("ejercicio")).toBe("2026");
        expect(campo("concepto")).toBe("Factura de compra 2026/17");
        expect(campo("manual")).toBe("Automático");
    });

    test("pinta las partidas del asiento con sus totales", async () => {
        getAsiento.mockResolvedValue(asientoDeFactura());

        render(<AsientoDeDocumento asientoId="128" />);

        expect(await screen.findByText("6000000")).toBeInTheDocument();
        expect(screen.getByText("4720000")).toBeInTheDocument();
        expect(screen.getByText("4000000")).toBeInTheDocument();

        // Los totales son un bloque de pares etiqueta/valor, no un único texto.
        const total = (etiqueta: string) =>
            [...document.querySelectorAll(".totales-asiento-item")]
                .find((item) => item.querySelector("label")?.textContent === `${etiqueta}:`)
                ?.querySelector("span")?.textContent;

        // Asiento cuadrado: 100 + 21 al debe, 121 al haber, sin descuadre.
        expect(total("Debe")).toMatch(/121,00/);
        expect(total("Haber")).toMatch(/121,00/);
        expect(document.querySelector(".totales-asiento-item--descuadre")).toBeNull();
    });

    test("avisa si el asiento no se puede cargar", async () => {
        getAsiento.mockRejectedValue(new Error("404"));

        render(<AsientoDeDocumento asientoId="128" />);

        expect(await screen.findByText(/No se ha podido cargar el asiento/)).toBeInTheDocument();
    });
});
