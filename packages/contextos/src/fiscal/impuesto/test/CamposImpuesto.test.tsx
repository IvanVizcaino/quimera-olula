import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useModelo } from "@olula/lib/useModelo.ts";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { getSubcuentas } = vi.hoisted(() => ({ getSubcuentas: vi.fn() }));

vi.mock("#/contabilidad/asiento/dominio.ts", () => ({ ejercicioActual: () => "2026" }));
vi.mock("#/contabilidad/subcuenta/infraestructura.ts", () => ({ getSubcuentas, getSubcuenta: vi.fn() }));

const { metaImpuesto, impuestoDesdeApi } = await import("../dominio.ts");
const { CamposImpuesto } = await import("../CamposImpuesto.tsx");

const Formulario = ({ api }: { api: Record<string, unknown> }) => {
    const { uiProps } = useModelo(metaImpuesto, impuestoDesdeApi(api));
    return <quimera-formulario><CamposImpuesto uiProps={uiProps} /></quimera-formulario>;
};

const campos = () => [...document.querySelectorAll("quimera-autocompletar")].map((c) => c.getAttribute("nombre"));

beforeEach(() => {
    getSubcuentas.mockReset().mockResolvedValue({
        datos: [{ codigo: "4720000000", nombre: "H.P. IVA soportado" }], total: 1,
    });
});

describe("CamposImpuesto — pestañas de contabilidad como impuestos.ui", () => {
    test("«Contabilidad Compras» con las subcuentas de compras en el orden de Eneboo", () => {
        render(<Formulario api={{ id: "GEN", iva: 21 }} />);

        expect(screen.getByRole("button", { name: "Contabilidad Compras" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Contabilidad Ventas" })).toBeTruthy();
        expect(campos()).toEqual([
            "sc_sop", "sc_deu", "sc_ivadevadue", "sc_ivadedadue", "sc_ivarepspue", "sc_ivasopspue",
            "sc_ivasopimp", "sc_ivarepimp", "sc_ivarepspim", "sc_ivasopspim", "sc_ivasopexe", "sc_ivasopagra",
        ]);
        expect(screen.getByText("I.V.A. Soportado (IVASOP)")).toBeTruthy();
    });

    test("«Contabilidad Ventas» con las de ventas", async () => {
        render(<Formulario api={{ id: "GEN", iva: 21 }} />);

        await userEvent.click(screen.getByRole("button", { name: "Contabilidad Ventas" }));
        expect(campos()).toEqual([
            "sc_rep", "sc_ivarepre", "sc_acr", "sc_ivadeventue", "sc_ivarepexp", "sc_ivarepexe", "sc_ivarepesue",
        ]);
    });

    test("cada subcuenta guardada se ve con su descripción del ejercicio actual", async () => {
        render(<Formulario api={{ id: "GEN", subcuentas: { sop: { codigo: "4720000000", id: 9 } } }} />);

        const sop = document.querySelector('quimera-autocompletar[nombre="sc_sop"] input[list]') as HTMLInputElement;
        await waitFor(() => expect(sop.value).toBe("4720000000 — H.P. IVA soportado"));
        expect(getSubcuentas).toHaveBeenCalledTimes(1);
        expect(JSON.stringify(getSubcuentas.mock.calls[0][0].filtro)).toContain('["ejercicio_id","2026"]');
    });
});
