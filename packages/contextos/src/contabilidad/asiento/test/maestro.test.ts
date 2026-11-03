import { criteriaDefecto } from "@olula/lib/dominio.ts";
import { describe, expect, test, vi } from "vitest";
import { ItemAsiento } from "../diseño.ts";
import { ContextoMaestroAsiento } from "../vistas/maestro/maquina.ts";

const { getAsientos } = vi.hoisted(() => ({ getAsientos: vi.fn() }));

vi.mock("../infraestructura.ts", () => ({ getAsiento: vi.fn(), getAsientos }));

const { recargarTrasRenumeracion } = await import("../vistas/maestro/maestro.ts");

const asiento = (id: string, numero: number): ItemAsiento => ({
    id,
    numero,
    ejercicioId: "2026",
    fecha: new Date("2026-03-01T12:00:00"),
    concepto: `Asiento ${numero}`,
    importe: 100,
    manual: true,
    tipoDocumento: "",
    documento: "",
});

const criteria = { ...criteriaDefecto, filtro: [["ejercicio_id", "eq", "2026"]] } as never;

const contextoRenumerando = (): ContextoMaestroAsiento => ({
    estado: "RENUMERANDO",
    asientos: {
        lista: [asiento("1", 7), asiento("2", 9)],
        total: 2,
        activo: "2",
        criteria,
    },
});

describe("recargarTrasRenumeracion", () => {
    test("conserva la lista activa con los asientos recargados", async () => {
        getAsientos.mockResolvedValue({
            datos: [asiento("1", 1), asiento("2", 2)],
            total: 2,
        });

        const ctx = (await recargarTrasRenumeracion(
            contextoRenumerando()
        )) as ContextoMaestroAsiento;

        // Si se extiende la promesa de Asientos.recargar sin esperarla, `asientos`
        // desaparece del contexto y el maestro revienta al leer `asientos.activo`.
        expect(ctx.asientos).toBeDefined();
        expect(ctx.asientos.lista.map((a) => a.numero)).toEqual([1, 2]);
        expect(ctx.asientos.total).toBe(2);
    });

    test("mantiene el asiento activo y el criteria, y vuelve a INICIAL", async () => {
        getAsientos.mockResolvedValue({ datos: [asiento("2", 2)], total: 1 });

        const ctx = (await recargarTrasRenumeracion(
            contextoRenumerando()
        )) as ContextoMaestroAsiento;

        expect(ctx.asientos.activo).toBe("2");
        expect(ctx.asientos.criteria).toBe(criteria);
        expect(ctx.estado).toBe("INICIAL");
    });

    test("recarga usando el criteria del contexto", async () => {
        getAsientos.mockResolvedValue({ datos: [], total: 0 });

        await recargarTrasRenumeracion(contextoRenumerando());

        expect(getAsientos).toHaveBeenCalledWith(criteria);
    });
});
