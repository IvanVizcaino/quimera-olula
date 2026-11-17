import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

const patchCerrarEjercicio = vi.fn(async () => ({}));
vi.mock("../infraestructura.ts", async (original) => ({
    ...(await original<typeof import("../infraestructura.ts")>()),
    patchCerrarEjercicio: (...args: unknown[]) => patchCerrarEjercicio(...(args as [])),
}));

import { CerrarEjercicio } from "../cerrar/CerrarEjercicio.tsx";
import { Ejercicio } from "../diseño.ts";
import { ejercicioVacio } from "../dominio.ts";

const ejercicio = (id: string, anyo: number): Ejercicio => ({
    ...ejercicioVacio(), id, nombre: `EJERCICIO ${id}`, tienePgc: true,
    fechaInicio: new Date(anyo, 0, 1, 12), fechaFin: new Date(anyo, 11, 31, 12),
});

describe("modal «Cerrar Ejercicio» (A5b)", () => {
    test("pérdidas y ganancias y cierre marcados y de solo lectura; apertura en el ejercicio elegido", async () => {
        const publicar = vi.fn(async () => {});
        const e26 = ejercicio("2026", 2026);
        render(<CerrarEjercicio ejercicio={e26} ejercicios={[e26, ejercicio("2027", 2027)]} publicar={publicar} />);

        expect(screen.getByText("Fecha de los asientos de regularización y cierre")).toBeInTheDocument();
        const pyg = screen.getByRole("checkbox", { name: /Asiento de pérdidas y ganancias/, hidden: true });
        const cierre = screen.getByRole("checkbox", { name: /Asiento cierre/, hidden: true });
        const apertura = screen.getByRole("checkbox", { name: /Asiento de apertura/, hidden: true });
        expect(pyg).toBeChecked();
        expect(pyg).toBeDisabled();
        expect(cierre).toBeChecked();
        expect(cierre).toBeDisabled();
        expect(apertura).toBeChecked();
        expect(apertura).toBeEnabled();
        expect(screen.getByText("Ejercicio de apertura")).toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", { name: "Cerrar", hidden: true }));
        expect(patchCerrarEjercicio).toHaveBeenCalledWith("2026", expect.objectContaining({
            regularizar: true, cerrar: true, abrir: true, ejercicioDestinoId: "2027",
        }));
        expect(publicar).toHaveBeenCalledWith("ejercicio_cerrado");
    });
});
