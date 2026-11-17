import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { getSubcuentas, getCuentas } = vi.hoisted(() => ({
    getSubcuentas: vi.fn(),
    getCuentas: vi.fn(),
}));

vi.mock("#/contabilidad/subcuenta/infraestructura.ts", () => ({ getSubcuentas, getSubcuenta: vi.fn() }));
vi.mock("#/contabilidad/cuenta/infraestructura.ts", () => ({ getCuentas, getCuenta: vi.fn() }));

const { CampoCuenta, CampoSubcuenta } = await import("../componentes/CampoCodigoContable.tsx");

const ventas = { codigo: "7000000000", nombre: "Ventas de mercaderías" };
const servicios = { codigo: "7050000000", nombre: "Prestaciones de servicios" };

/** El filtro que llegó a la consulta en la llamada `n`. */
const filtroDeLlamada = (mock: ReturnType<typeof vi.fn>, n = 0) =>
    JSON.stringify(mock.mock.calls[n][0].filtro);

const entrada = () => document.querySelector<HTMLInputElement>('input[list]')!;

beforeEach(() => {
    getSubcuentas.mockReset();
    getCuentas.mockReset();
});

describe("CampoSubcuenta — subcuenta por código con desplegable", () => {
    test("al escribir busca por código o descripción en el ejercicio y al elegir pone código y descripción", async () => {
        getSubcuentas.mockResolvedValue({ datos: [ventas, servicios], total: 2 });
        const onChange = vi.fn();
        render(
            <quimera-formulario>
                <CampoSubcuenta label="Subcuenta de ventas" nombre="codigoSubcuenta"
                    ejercicioId="2026" valor="" onChange={onChange} />
            </quimera-formulario>
        );

        await userEvent.type(entrada(), "70");
        await waitFor(() => expect(document.querySelectorAll("datalist option")).toHaveLength(2));
        const filtro = filtroDeLlamada(getSubcuentas);
        expect(filtro).toContain('["ejercicio_id","2026"]');
        expect(filtro).toContain('["codigo","~","70"]');
        expect(filtro).toContain('["nombre","~","70"]');
        expect([...document.querySelectorAll("datalist option")].map((o) => o.getAttribute("value")))
            .toEqual(["7000000000 — Ventas de mercaderías", "7050000000 — Prestaciones de servicios"]);

        fireEvent.input(entrada(), { target: { value: "7050000000 — Prestaciones de servicios" } });
        expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({
            valor: "7050000000",
            descripcion: "7050000000 — Prestaciones de servicios",
        }));
    });

    test("con un código guardado muestra código y descripción del ejercicio", async () => {
        getSubcuentas.mockResolvedValue({ datos: [ventas], total: 1 });
        render(
            <quimera-formulario>
                <CampoSubcuenta label="Subcuenta" nombre="sc" ejercicioId="2026" valor="7000000000" />
            </quimera-formulario>
        );

        await waitFor(() => expect(entrada().value).toBe("7000000000 — Ventas de mercaderías"));
        const filtro = filtroDeLlamada(getSubcuentas);
        expect(filtro).toContain('["codigo","7000000000"]');
        expect(filtro).toContain('["ejercicio_id","2026"]');
    });

    test("si el código no está en el ejercicio se ve solo el código", async () => {
        getSubcuentas.mockResolvedValue({ datos: [], total: 0 });
        render(
            <quimera-formulario>
                <CampoSubcuenta label="Subcuenta" nombre="sc" ejercicioId="2026" valor="4770000000" />
            </quimera-formulario>
        );

        await waitFor(() => expect(getSubcuentas).toHaveBeenCalled());
        expect(entrada().value).toBe("4770000000");
    });

    test("al vaciarlo avisa con valor vacío, no null", async () => {
        getSubcuentas.mockResolvedValue({ datos: [ventas], total: 1 });
        const onChange = vi.fn();
        render(
            <quimera-formulario>
                <CampoSubcuenta label="Subcuenta" nombre="sc" ejercicioId="2026"
                    valor="7000000000" onChange={onChange} />
            </quimera-formulario>
        );
        await waitFor(() => expect(entrada().value).toContain("Ventas"));

        await userEvent.click(screen.getByRole("button", { name: "Limpiar selección" }));
        expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ valor: "" }));
    });
});

describe("CampoCuenta — cuenta por código con desplegable", () => {
    test("busca en co_cuentas del ejercicio y guarda el código", async () => {
        getCuentas.mockResolvedValue({ datos: [{ codigo: "700", nombre: "Ventas" }], total: 1 });
        const onChange = vi.fn();
        render(
            <quimera-formulario>
                <CampoCuenta label="Cuenta de ventas" nombre="codigoCuenta"
                    ejercicioId="2025" valor="" onChange={onChange} />
            </quimera-formulario>
        );

        await userEvent.type(entrada(), "ven");
        await waitFor(() => expect(document.querySelectorAll("datalist option")).toHaveLength(1));
        expect(filtroDeLlamada(getCuentas)).toContain('["ejercicio_id","2025"]');
        expect(getSubcuentas).not.toHaveBeenCalled();

        fireEvent.input(entrada(), { target: { value: "700 — Ventas" } });
        expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ valor: "700" }));
    });
});
