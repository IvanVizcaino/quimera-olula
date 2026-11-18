import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

vi.mock("@olula/lib/dominio.ts", async (original) => ({
    ...(await original<typeof import("@olula/lib/dominio.ts")>()),
    puede: () => true,
}));
vi.mock("../infraestructura.ts", async (original) => ({
    ...(await original<typeof import("../infraestructura.ts")>()),
    getEjercicios: async () => ({ datos: [], total: 0 }),
}));

import { MaestroConDetalleEjercicio } from "../maestro/MaestroConDetalleEjercicio.tsx";

describe("maestro de ejercicios (A2-A3)", () => {
    test("Contabilidad no ofrece «Nuevo ejercicio»", async () => {
        render(<MaestroConDetalleEjercicio />);
        expect(await screen.findByText("Apertura y Cierre de Ejercicio")).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /nuevo ejercicio/i })).not.toBeInTheDocument();
    });

    test("Fiscalidad sí ofrece «Nuevo ejercicio»", async () => {
        render(<MaestroConDetalleEjercicio titulo="Ejercicios fiscales" conAlta />);
        expect(await screen.findByText("Ejercicios fiscales")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /nuevo ejercicio/i })).toBeInTheDocument();
    });
});
