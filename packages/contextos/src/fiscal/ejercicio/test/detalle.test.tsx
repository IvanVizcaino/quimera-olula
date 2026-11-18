import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { describe, expect, test, vi } from "vitest";

vi.mock("@olula/lib/dominio.ts", async (original) => ({
    ...(await original<typeof import("@olula/lib/dominio.ts")>()),
    puede: () => true,
}));
vi.mock("../infraestructura.ts", async (original) => ({
    ...(await original<typeof import("../infraestructura.ts")>()),
    getSecuenciasContabilidad: async () => [
        { id: "1", nombre: "nasiento", descripcion: "", valor: null, valorout: 8 },
    ],
}));
vi.mock("#/contabilidad/ejercicio/infraestructura.ts", async (original) => ({
    ...(await original<typeof import("#/contabilidad/ejercicio/infraestructura.ts")>()),
    getEjercicio: async (id: string) => ({
        id, nombre: `EJERCICIO ${id}`, empresaId: 1,
        fechaInicio: new Date(2026, 0, 1, 12), fechaFin: new Date(2026, 11, 31, 12),
        estado: "ABIERTO", digitosSubcuenta: 10, planContable: "08", tienePgc: true,
        asientoAperturaId: null, asientoPygId: null, asientoCierreId: null,
    }),
    getSeriesEjercicio: async () => [{ id: "1", serieId: "A", descripcion: "SERIE A" }],
    getOpcionesSeries: async () => [],
    getFilasAsientosEjercicio: async () => [{
        id: "12", tipo: "APERTURA", titulo: "Asiento de apertura", numero: 1, ejercicioId: "2026",
        fecha: new Date(2026, 0, 1, 12), concepto: "Asiento de apertura de ejercicio 2026", importe: 50,
    }],
}));

import { DetalleEjercicioFiscal } from "../detalle/DetalleEjercicioFiscal.tsx";

const filaDe = (texto: string) =>
    screen.getByText(texto, { selector: ".etiqueta" }).closest(".FilaFormulario");

const Destino = () => {
    const { pathname, search } = useLocation();
    return <p>{`destino ${pathname}${search}`}</p>;
};

const pintar = () => render(
    <MemoryRouter initialEntries={["/fiscal/ejercicio"]}>
        <Routes>
            <Route path="/fiscal/ejercicio" element={<DetalleEjercicioFiscal id="2026" ejercicios={[]} />} />
            <Route path="/contabilidad/asiento" element={<Destino />} />
        </Routes>
    </MemoryRouter>
);

describe("edición de ejercicio fiscal (B4a)", () => {
    test("Código + Nombre, Inicio + Fin + Dígitos y Estado + Plan contable en filas", async () => {
        pintar();
        expect(await screen.findByText("SERIE A")).toBeInTheDocument();
        expect(filaDe("Código")).not.toBeNull();
        expect(filaDe("Código")).toBe(filaDe("Nombre"));
        expect(filaDe("Inicio")).toBe(filaDe("Dígitos de subcuenta"));
        expect(filaDe("Estado")).not.toBeNull();
        expect(filaDe("Estado")).toBe(filaDe("Plan contable"));
    });

    test("sin el campo Serie: las series se añaden y copian desde botones", async () => {
        pintar();
        await screen.findByText("SERIE A");
        expect(screen.queryByText("Serie", { selector: ".etiqueta" })).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Añadir serie" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Quitar serie" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Copiar series" })).toBeInTheDocument();
    });

    test("pestaña Series con «Secuencias por serie» (B4b)", async () => {
        pintar();
        await screen.findByText("SERIE A");
        expect(screen.getAllByText("Series").length).toBeGreaterThan(0);
        expect(screen.getByRole("button", { name: "Secuencias por serie" })).toBeInTheDocument();
    });

    test("pestaña «Secuencias contabilidad» con las co_secuencias del ejercicio (B4c)", async () => {
        pintar();
        await screen.findByText("SERIE A");
        await userEvent.click(screen.getByText("Secuencias contabilidad"));
        expect(await screen.findByText("nasiento")).toBeInTheDocument();
        expect(screen.getByText("8")).toBeInTheDocument();
    });

    test("pestaña «Asientos» con «Ir a ver asiento» (B4d)", async () => {
        pintar();
        await screen.findByText("SERIE A");
        await userEvent.click(screen.getByText("Asientos"));
        await userEvent.click(await screen.findByText("Asiento de apertura de ejercicio 2026"));
        await userEvent.click(screen.getByRole("button", { name: "Ir a ver asiento" }));
        expect(await screen.findByText("destino /contabilidad/asiento?id=12&ejercicio_id=eq__2026"))
            .toBeInTheDocument();
    });
});
