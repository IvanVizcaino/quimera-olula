import { render, waitFor } from "@testing-library/react";
import { useModelo } from "@olula/lib/useModelo.ts";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { getSubcuentas, getCuentas } = vi.hoisted(() => ({ getSubcuentas: vi.fn(), getCuentas: vi.fn() }));

vi.mock("#/contabilidad/asiento/dominio.ts", () => ({ ejercicioActual: () => "2026" }));
vi.mock("#/contabilidad/subcuenta/infraestructura.ts", () => ({ getSubcuentas, getSubcuenta: vi.fn() }));
vi.mock("#/contabilidad/cuenta/infraestructura.ts", () => ({ getCuentas, getCuenta: vi.fn() }));

const { metaSerie, serieDesdeApi } = await import("../dominio.ts");
const { CamposSerie } = await import("../CamposSerie.tsx");

const Formulario = ({ api }: { api: Record<string, unknown> }) => {
    const { uiProps } = useModelo(metaSerie, serieDesdeApi(api));
    return <quimera-formulario><CamposSerie uiProps={uiProps} /></quimera-formulario>;
};

const entrada = (etiqueta: string) =>
    [...document.querySelectorAll("quimera-autocompletar")]
        .find((c) => c.textContent?.includes(etiqueta))!
        .querySelector<HTMLInputElement>("input[list]")!;

beforeEach(() => {
    getSubcuentas.mockReset().mockResolvedValue({ datos: [{ codigo: "7000000000", nombre: "Ventas" }], total: 1 });
    getCuentas.mockReset().mockResolvedValue({ datos: [{ codigo: "700", nombre: "Ventas de mercaderías" }], total: 1 });
});

describe("CamposSerie — cuenta y subcuenta de ventas con desplegable", () => {
    test("la subcuenta guardada se ve con su descripción del ejercicio actual; la cuenta queda deshabilitada", async () => {
        render(<Formulario api={{ id: "A", codigo_subcuenta: "7000000000" }} />);

        await waitFor(() => expect(entrada("Subcuenta de ventas").value).toBe("7000000000 — Ventas"));
        expect(JSON.stringify(getSubcuentas.mock.calls[0][0].filtro)).toContain('["ejercicio_id","2026"]');
        expect(entrada("Cuenta de ventas").disabled).toBe(true);
        expect(entrada("Subcuenta de ventas").disabled).toBe(false);
    });

    test("con cuenta de ventas, la subcuenta queda deshabilitada", async () => {
        render(<Formulario api={{ id: "A", codigo_cuenta: "700" }} />);

        await waitFor(() => expect(entrada("Cuenta de ventas").value).toBe("700 — Ventas de mercaderías"));
        expect(entrada("Subcuenta de ventas").disabled).toBe(true);
    });

    test("sin ninguna, las dos se pueden editar", () => {
        render(<Formulario api={{ id: "A" }} />);

        expect(entrada("Cuenta de ventas").disabled).toBe(false);
        expect(entrada("Subcuenta de ventas").disabled).toBe(false);
    });
});
