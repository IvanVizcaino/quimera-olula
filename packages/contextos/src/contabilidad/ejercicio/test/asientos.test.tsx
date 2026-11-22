import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { describe, expect, test, vi } from "vitest";

vi.mock("#/contabilidad/asiento/infraestructura.ts", () => ({
    getAsiento: async (id: string) => {
        if (id === "99") throw new Error("404");
        return {
            id, numero: Number(id) * 10, ejercicioId: id === "3" ? "2026" : "2027",
            fecha: new Date(2026, 11, 31, 12), concepto: `Asiento ${id}`, importe: 100,
            manual: false, tipoDocumento: "", documento: "", partidas: [],
        };
    },
}));

import { AsientosEjercicio } from "../asientos/AsientosEjercicio.tsx";
import { ejercicioVacio } from "../dominio.ts";

const Destino = () => {
    const { pathname, search } = useLocation();
    return <p>{`destino ${pathname}${search}`}</p>;
};

const pintar = (cambios = {}) => render(
    <MemoryRouter initialEntries={["/contabilidad/ejercicio"]}>
        <Routes>
            <Route path="/contabilidad/ejercicio" element={
                <AsientosEjercicio ejercicio={{ ...ejercicioVacio(), id: "2026", ...cambios }} />
            } />
            <Route path="/contabilidad/asiento" element={<Destino />} />
        </Routes>
    </MemoryRouter>
);

describe("tabla de asientos del ejercicio (A4 / B4d)", () => {
    test("enseña apertura, regularización y cierre con número y fecha dd/mm/aaaa", async () => {
        pintar({ asientoAperturaId: 3, asientoPygId: 4, asientoCierreId: 5 });
        expect(await screen.findByText("Asiento de apertura")).toBeInTheDocument();
        expect(screen.getByText("Asiento de regularización (pérdidas y ganancias)")).toBeInTheDocument();
        expect(screen.getByText("Asiento de cierre")).toBeInTheDocument();
        expect(screen.getAllByText("31/12/2026")).toHaveLength(3);
    });

    test("«Ir a ver asiento» abre el asiento elegido en Contabilidad > Asientos", async () => {
        pintar({ asientoAperturaId: 3, asientoCierreId: 5 });
        const boton = screen.getByRole("button", { name: "Ir a ver asiento" });
        expect(boton.closest("quimera-boton")).toHaveAttribute("deshabilitado");
        await userEvent.click(await screen.findByText("Asiento 5"));
        expect(boton.closest("quimera-boton")).not.toHaveAttribute("deshabilitado");
        await userEvent.click(boton);
        expect(await screen.findByText("destino /contabilidad/asiento?id=5&ejercicio_id=eq__2027"))
            .toBeInTheDocument();
    });

    test("sin asientos lo dice; un asiento borrado sale sin datos", async () => {
        const { unmount } = pintar();
        expect(await screen.findByText(/no tiene asientos/)).toBeInTheDocument();
        unmount();
        pintar({ asientoCierreId: 99 });
        expect(await screen.findByText("(no se encuentra el asiento)")).toBeInTheDocument();
    });
});
