import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { SecuenciaSerie } from "../diseño.ts";
import { cambiosSecuencia, datosSecuencia, metaDatosSecuencia } from "../dominio.ts";

const patchSecuenciaSerie = vi.fn(async () => {});
vi.mock("../infraestructura.ts", async (original) => ({
    ...(await original<typeof import("../infraestructura.ts")>()),
    getSecuenciasSerie: async () => [
        { id: "npresupuestocli", idsec: 4, nombre: "npresupuestocli", descripcion: "Presupuesto de cliente",
            valor: 1, valorout: 9, valorini: 1 },
        { id: "nfacturacli", idsec: null, nombre: "nfacturacli", descripcion: "Facturas de cliente",
            valor: null, valorout: null, valorini: null },
    ],
    patchSecuenciaSerie: (...args: unknown[]) => patchSecuenciaSerie(...(args as [])),
}));

import { secuenciaSerieDesdeApi } from "../infraestructura.ts";
import { SecuenciasSerie } from "../secuencias/SecuenciasSerie.tsx";

const existente: SecuenciaSerie = {
    id: "nfacturacli", idsec: 3, nombre: "nfacturacli", descripcion: "Facturas de cliente",
    valor: 1, valorout: 7, valorini: 1,
};

describe("secuencias por serie (B4b)", () => {
    test("solo manda lo que cambia; una secuencia nueva lo manda todo", () => {
        const datos = datosSecuencia(existente);
        expect(cambiosSecuencia(existente, { ...datos, valorout: "25" })).toEqual({ valorout: 25 });
        expect(cambiosSecuencia(existente, { ...datos, valorini: "" })).toEqual({ valorini: null });
        const nueva = { ...existente, idsec: null, valor: null, valorout: null, valorini: null };
        expect(cambiosSecuencia(nueva, { ...datosSecuencia(nueva), valorout: "5" })).toEqual({
            descripcion: "Facturas de cliente", valor: null, valorout: 5, valorini: null,
        });
    });

    test("valores enteros no negativos", () => {
        const datos = datosSecuencia(existente);
        expect(metaDatosSecuencia.validacion?.(datos)).toBe(true);
        expect(metaDatosSecuencia.validacion?.({ ...datos, valorout: "-1" })).toMatch(/sin bloqueo/);
        expect(metaDatosSecuencia.validacion?.({ ...datos, valor: "2,5" })).toMatch(/valor/);
    });

    test("mapea la respuesta del servidor", () => {
        expect(secuenciaSerieDesdeApi({
            id: null, nombre: "npedidocli", descripcion: null, valor: null, valorout: null, valorini: null,
        })).toEqual({
            id: "npedidocli", idsec: null, nombre: "npedidocli", descripcion: "",
            valor: null, valorout: null, valorini: null,
        });
    });

    test("el modal lista las secuencias y guarda la elegida", async () => {
        render(<SecuenciasSerie ejercicioId="2026" serieId="A" editable onCerrar={vi.fn()} />);
        await userEvent.click(await screen.findByText("Presupuesto de cliente"));
        const valorSinBloqueo = screen.getByRole("textbox", { name: /Valor sin bloqueo/, hidden: true });
        await userEvent.clear(valorSinBloqueo);
        await userEvent.type(valorSinBloqueo, "30");
        await userEvent.click(screen.getByRole("button", { name: "Guardar", hidden: true }));
        expect(patchSecuenciaSerie).toHaveBeenCalledWith("2026", "A", "npresupuestocli", { valorout: 30 });
    });
});
