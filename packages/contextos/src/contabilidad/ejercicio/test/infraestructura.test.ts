import { describe, expect, test, vi } from "vitest";

const { patch } = vi.hoisted(() => ({
    patch: vi.fn(),
}));

vi.mock("@olula/lib/api/rest_api.js", () => ({
    RestAPI: { patch },
}));

import {
    patchBorrarAsientoAperturaEjercicio,
    patchCerrarEjercicio,
    patchCrearAsientoAperturaEjercicio,
    patchReabrirEjercicio,
    resultadoCierreEjercicioDesdeApi,
} from "../infraestructura.ts";

describe("ejercicio cierre infraestructura (CF-02)", () => {
    test("resultadoCierreEjercicioDesdeApi mapea ids", () => {
        const r = resultadoCierreEjercicioDesdeApi({
            ejercicio_id: "2025",
            estado: "CERRADO",
            id_asiento_pyg: null,
            id_asiento_cierre: 123,
            id_asiento_apertura: null,
        });
        expect(r.ejercicioId).toBe("2025");
        expect(r.idAsientoCierre).toBe(123);
    });

    test("patchCerrarEjercicio llama PATCH cerrar", async () => {
        patch.mockResolvedValueOnce({
            ejercicio_id: "2025",
            estado: "CERRADO",
            id_asiento_pyg: null,
            id_asiento_cierre: 1,
            id_asiento_apertura: null,
        });

        await patchCerrarEjercicio("2025", {
            fecha: "2025-12-31",
            asientoPyg: false,
            asientoCierre: true,
            asientoApertura: false,
        });

        expect(patch).toHaveBeenCalledWith(
            "/contabilidad/ejercicio/2025/cerrar",
            {
                fecha: "2025-12-31",
                asiento_pyg: false,
                asiento_cierre: true,
                asiento_apertura: false,
            },
            "Error al cerrar ejercicio"
        );
    });

    test("patchReabrirEjercicio y borrar apertura", async () => {
        const payload = {
            ejercicio_id: "2025",
            estado: "ABIERTO",
            id_asiento_pyg: null,
            id_asiento_cierre: null,
            id_asiento_apertura: null,
        };
        patch.mockResolvedValueOnce(payload);
        await patchReabrirEjercicio("2025");
        expect(patch).toHaveBeenLastCalledWith(
            "/contabilidad/ejercicio/2025/reabrir",
            {},
            "Error al reabrir ejercicio"
        );

        patch.mockResolvedValueOnce(payload);
        await patchBorrarAsientoAperturaEjercicio("2026");
        expect(patch).toHaveBeenLastCalledWith(
            "/contabilidad/ejercicio/2026/borrar_asiento_apertura",
            {},
            "Error al borrar asiento de apertura"
        );
    });

    test("patchCrearAsientoAperturaEjercicio", async () => {
        patch.mockResolvedValueOnce({
            ejercicio_id: "2026",
            estado: "ABIERTO",
            id_asiento_pyg: null,
            id_asiento_cierre: null,
            id_asiento_apertura: 99,
        });

        const r = await patchCrearAsientoAperturaEjercicio("2026", 12345);

        expect(patch).toHaveBeenCalledWith(
            "/contabilidad/ejercicio/2026/asiento_apertura",
            { id_asiento_cierre: 12345 },
            "Error al crear asiento de apertura"
        );
        expect(r.idAsientoApertura).toBe(99);
    });
});
