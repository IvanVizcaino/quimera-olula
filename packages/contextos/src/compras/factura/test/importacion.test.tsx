import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { Factura, ImportacionFactura } from "../diseño.ts";

const { patch, post } = vi.hoisted(() => ({ patch: vi.fn(), post: vi.fn() }));

vi.mock("@olula/lib/api/rest_api.ts", () => ({
    RestAPI: { patch, post },
}));

vi.mock("#/compras/comun/componentes/factura.tsx", () => ({
    FacturaCompra: ({
        valor,
        onChange,
    }: {
        valor: string;
        onChange?: (o: { valor: string; descripcion: string }) => void;
    }) => (
        <button
            data-testid="fra-importacion"
            onClick={() => onChange?.({ valor: "77", descripcion: "FAC77" })}
        >
            {valor || "sin-factura"}
        </button>
    ),
}));

const { facturaVacia } = await import("../detalle/detalle.ts");
const { TabImportacion } = await import("../detalle/TabImportacion.tsx");
const {
    cambiosImportacionAApi,
    facturaDesdeApi,
    importacionDesdeApi,
    patchImportacionFactura,
    postLineaIvaImportacion,
} = await import("../infraestructura.ts");
const { cambiosImportacion, filtroFacturasImportacion, importacionVacia, validaDua } = await import("../dominio.ts");

const DUA18 = "18ES0000000000001A";

describe("validaDua (Eneboo formUTIL.validaDUA)", () => {
    test("vacío o de 18 caracteres es válido", () => {
        expect(validaDua("")).toBe(true);
        expect(validaDua(null)).toBe(true);
        expect(validaDua(DUA18)).toBe(true);
    });

    test("cualquier otra longitud no es válida", () => {
        expect(DUA18).toHaveLength(18);
        expect(validaDua("123")).toBe(false);
        expect(validaDua(DUA18 + "X")).toBe(false);
    });
});

describe("importación: dominio e infraestructura", () => {
    test("importacionDesdeApi mapea todos los campos y normaliza el tratamiento", () => {
        const i = importacionDesdeApi({
            factura_importacion_id: "5",
            factura_dua_id: "9",
            dua: DUA18,
            fecha_dua: "2026-03-01",
            base: 1000,
            tipo_iva: 21,
            cuota: 210,
            tratamiento: "Reversión",
        });
        expect(i).toMatchObject({
            facturaImportacionId: "5",
            facturaDuaId: "9",
            dua: DUA18,
            base: 1000,
            tipoIva: 21,
            cuota: 210,
            tratamiento: "Reversión",
        });
        expect(i?.fechaDua?.toISOString().slice(0, 10)).toBe("2026-03-01");
        expect(importacionDesdeApi(null)).toBeNull();
        expect(importacionDesdeApi(undefined)).toBeNull();
    });

    test("facturaDesdeApi sin plugin deja importacion en null", () => {
        const api = { id: "1", fecha: "2026-01-01", hora: "10:00:00" } as Parameters<typeof facturaDesdeApi>[0];
        expect(facturaDesdeApi(api).importacion).toBeNull();
    });

    test("cambiosImportacion solo incluye lo modificado y compara fechas por valor", () => {
        const original: ImportacionFactura = {
            ...importacionVacia(),
            dua: DUA18,
            fechaDua: new Date("2026-03-01"),
        };
        expect(cambiosImportacion(original, { ...original, fechaDua: new Date("2026-03-01") })).toEqual({});
        expect(cambiosImportacion(original, { ...original, cuota: 5, tratamiento: "Reversión" })).toEqual({
            cuota: 5,
            tratamiento: "Reversión",
        });
        expect(cambiosImportacion(null, importacionVacia())).toEqual({});
    });

    test("cambiosImportacionAApi usa null para borrar y no envía factura_dua_id", () => {
        expect(
            cambiosImportacionAApi({
                facturaImportacionId: null,
                dua: null,
                fechaDua: null,
                facturaDuaId: "9",
                base: 10,
            }),
        ).toEqual({ factura_importacion_id: null, dua: null, fecha_dua: null, base: 10 });
    });

    test("patchImportacionFactura envía cambios.importacion al PATCH de la factura", async () => {
        patch.mockResolvedValue(undefined);
        await patchImportacionFactura("12", { dua: DUA18, tratamiento: "Total", cuota: 21 });
        expect(patch).toHaveBeenCalledWith(
            expect.stringMatching(/\/12$/),
            { cambios: { importacion: { dua: DUA18, tratamiento: "Total", cuota: 21 } } },
            expect.any(String),
        );
    });

    test("postLineaIvaImportacion llama al POST linea_iva_importacion", async () => {
        post.mockResolvedValue({ linea_id: "99" });
        await expect(postLineaIvaImportacion("12")).resolves.toBe("99");
        expect(post).toHaveBeenCalledWith(
            expect.stringMatching(/\/compras\/factura\/12\/linea_iva_importacion$/),
            {},
            expect.any(String),
        );
    });
});

describe("filtro del selector de factura de importación", () => {
    test("solo facturas sin DUA asociado y sin la propia factura", () => {
        expect(filtroFacturasImportacion("12")).toEqual([["factura_dua_id", "null"], ["id", "!", "12"]]);
        expect(filtroFacturasImportacion("")).toEqual([["factura_dua_id", "null"]]);
    });
});

describe("TabImportacion (plugin facturas_impor)", () => {
    const factura = (importacion: ImportacionFactura | null = null): Factura => ({
        ...facturaVacia(),
        id: "12",
        editable: true,
        importacion,
    });

    const duaInput = () =>
        document.querySelector('quimera-input[nombre="dua"] input') as HTMLInputElement;

    beforeEach(() => {
        HTMLDialogElement.prototype.showModal = vi.fn();
        HTMLDialogElement.prototype.close = vi.fn();
    });

    test("sin cambios el botón Guardar está deshabilitado y no envía nada", async () => {
        const onGuardar = vi.fn();
        render(<TabImportacion factura={factura()} onGuardar={onGuardar} />);
        const boton = screen.getByText("Guardar importación");
        expect(boton.closest("quimera-boton")).toHaveAttribute("deshabilitado");
        await userEvent.click(boton);
        expect(onGuardar).not.toHaveBeenCalled();
    });

    test("DUA de 18 caracteres: guarda directamente sin aviso", async () => {
        const onGuardar = vi.fn().mockResolvedValue(undefined);
        render(<TabImportacion factura={factura()} onGuardar={onGuardar} />);
        await userEvent.type(duaInput(), DUA18);
        await userEvent.click(screen.getByText("Guardar importación"));
        await waitFor(() => expect(onGuardar).toHaveBeenCalledWith({ dua: DUA18 }));
        expect(screen.queryByText(/distinto de 18 caracteres/)).not.toBeInTheDocument();
    });

    test("DUA distinto de 18: pide confirmación con el literal de Eneboo y solo guarda al aceptar", async () => {
        const onGuardar = vi.fn().mockResolvedValue(undefined);
        render(<TabImportacion factura={factura()} onGuardar={onGuardar} />);
        await userEvent.type(duaInput(), "ABC");
        await userEvent.click(screen.getByText("Guardar importación"));

        const aviso = await screen.findByText(/Está introduciendo un DUA distinto de 18 caracteres/);
        expect(aviso.textContent).toContain("¿Desea continuar?");
        expect(onGuardar).not.toHaveBeenCalled();

        await userEvent.click(within(aviso.closest("dialog")!).getByText("Aceptar"));
        await waitFor(() => expect(onGuardar).toHaveBeenCalledWith({ dua: "ABC" }));
    });

    test("DUA distinto de 18: cancelar no guarda", async () => {
        const onGuardar = vi.fn();
        render(<TabImportacion factura={factura()} onGuardar={onGuardar} />);
        await userEvent.type(duaInput(), "ABC");
        await userEvent.click(screen.getByText("Guardar importación"));
        const aviso = await screen.findByText(/distinto de 18 caracteres/);
        await userEvent.click(within(aviso.closest("dialog")!).getByText("Cancelar"));
        expect(onGuardar).not.toHaveBeenCalled();
    });

    test("elegir factura de importación se envía como factura_importacion_id", async () => {
        const onGuardar = vi.fn().mockResolvedValue(undefined);
        render(<TabImportacion factura={factura()} onGuardar={onGuardar} />);
        await userEvent.click(screen.getByTestId("fra-importacion"));
        await userEvent.click(screen.getByText("Guardar importación"));
        await waitFor(() => expect(onGuardar).toHaveBeenCalledWith({ facturaImportacionId: "77" }));
    });

    test("Crear línea (Eneboo tbnCrearLinea) llama onCrearLineaIva", async () => {
        const onGuardar = vi.fn();
        const onCrearLineaIva = vi.fn().mockResolvedValue(undefined);
        render(
            <TabImportacion
                factura={factura()}
                onGuardar={onGuardar}
                onCrearLineaIva={onCrearLineaIva}
            />
        );
        await userEvent.click(screen.getByText("Crear línea"));
        await waitFor(() => expect(onCrearLineaIva).toHaveBeenCalledTimes(1));
        expect(onGuardar).not.toHaveBeenCalled();
    });

    test("Crear línea deshabilitado si la factura no es editable", () => {
        render(
            <TabImportacion
                factura={{ ...factura(), editable: false }}
                onGuardar={vi.fn()}
                onCrearLineaIva={vi.fn()}
            />
        );
        expect(screen.getByText("Crear línea").closest("quimera-boton")).toHaveAttribute(
            "deshabilitado"
        );
    });
});
