import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { Composicion } from "../diseño.ts";

const getComposicion = vi.fn();
const getComposiciones = vi.fn();
const postComposicion = vi.fn();
const patchComposicion = vi.fn();
const deleteComposicion = vi.fn();
const getEmpresa = vi.fn();

vi.mock("../infraestructura.ts", () => ({
    getComposicion: (...a: unknown[]) => getComposicion(...a),
    getComposiciones: (...a: unknown[]) => getComposiciones(...a),
    postComposicion: (...a: unknown[]) => postComposicion(...a),
    patchComposicion: (...a: unknown[]) => patchComposicion(...a),
    deleteComposicion: (...a: unknown[]) => deleteComposicion(...a),
}));

vi.mock("#/empresa/empresa/infraestructura.ts", () => ({
    getEmpresa: (...a: unknown[]) => getEmpresa(...a),
}));

// Selectores remotos sustituidos por stubs mínimos.
vi.mock("#/almacen/comun/componentes/Almacen.tsx", () => ({
    Almacen: ({ valor, nombre }: { valor: string; nombre: string }) => (
        <span data-testid={`almacen-${nombre}`}>{valor}</span>
    ),
}));
vi.mock("#/almacen/comun/componentes/Articulo.tsx", () => ({
    Articulo: ({
        valor,
        nombre,
        onChange,
    }: {
        valor: string;
        nombre: string;
        onChange?: (o: { valor: string; descripcion: string }) => void;
    }) => (
        <button
            data-testid={`articulo-${nombre}`}
            onClick={() => onChange?.({ valor: "KIT01", descripcion: "Kit" })}
        >
            {valor || "sin-articulo"}
        </button>
    ),
}));

const { CrearComposicion } = await import("../crear/CrearComposicion.tsx");
const { DetalleComposicion, MENSAJE_GENERAR_COMPOSICION } = await import(
    "../detalle/DetalleComposicion.tsx"
);
const { MaestroComposicion } = await import("../maestro/MaestroComposicion.tsx");

const composicion: Composicion = {
    id: "5",
    fecha: "2026-10-01",
    hora: "10:30:00",
    almacenId: "ALG",
    articuloId: "KIT01",
    descripcion: "Kit regalo",
    cantidad: 2,
    usuarioId: "ivan",
    lineas: [{ id: "9", articuloId: "COMP1", descripcion: "Componente 1", cantidad: 4, almacenId: "ALG" }],
};

describe("vistas de composición (T2.6)", () => {
    beforeEach(() => {
        [getComposicion, getComposiciones, postComposicion, patchComposicion, deleteComposicion, getEmpresa].forEach(
            (m) => m.mockReset(),
        );
        getComposicion.mockResolvedValue(composicion);
        getComposiciones.mockResolvedValue({ datos: [composicion], total: 1 });
        postComposicion.mockResolvedValue("5");
        patchComposicion.mockResolvedValue(undefined);
        getEmpresa.mockResolvedValue({ almacenId: "ALG" });
        localStorage.setItem(
            "whoami",
            JSON.stringify({
                empresas: [{ id: "1", nombre: "Crema" }],
                plugins: { articulos_compuestos: "activa" },
                permisos: [{ id_regla: "general", valor: true }],
            }),
        );
        HTMLDialogElement.prototype.showModal = vi.fn();
        HTMLDialogElement.prototype.close = vi.fn();
    });

    test("alta: precarga el almacén por defecto de la empresa y lo envía al crear", async () => {
        const publicar = vi.fn();
        render(<CrearComposicion activo={true} publicar={publicar} />);

        await waitFor(() => expect(screen.getByTestId("almacen-almacenId")).toHaveTextContent("ALG"));
        expect(getEmpresa).toHaveBeenCalledWith("1");

        await userEvent.click(screen.getByTestId("articulo-articuloId"));
        await userEvent.click(screen.getByText("Crear"));

        expect(postComposicion).toHaveBeenCalledTimes(1);
        expect(postComposicion.mock.calls[0][0]).toMatchObject({
            almacenId: "ALG",
            articuloId: "KIT01",
            cantidad: 1,
        });
        await waitFor(() => expect(publicar).toHaveBeenCalledWith("composicion_creada", composicion));
    });

    test("alta: sin almacén por defecto el campo queda vacío", async () => {
        getEmpresa.mockResolvedValue({ almacenId: "" });
        render(<CrearComposicion activo={true} />);
        await waitFor(() => expect(getEmpresa).toHaveBeenCalled());
        expect(screen.getByTestId("almacen-almacenId")).toHaveTextContent("");
    });

    test("detalle: muestra cabecera y componentes; generar pide confirmación y envía regenerar_lineas", async () => {
        render(<DetalleComposicion id="5" />);

        expect(await screen.findByText("5 - Kit regalo")).toBeInTheDocument();
        await userEvent.click(screen.getByText("Componentes usados"));
        expect(screen.getByTestId("articulo-articulo_0")).toHaveTextContent("COMP1");

        await userEvent.click(screen.getByText("Generar composición", { selector: "button" }));
        const mensaje = await screen.findByText(MENSAJE_GENERAR_COMPOSICION);
        await userEvent.click(within(mensaje.closest("dialog")!).getByText("Aceptar"));

        await waitFor(() => expect(patchComposicion).toHaveBeenCalledTimes(1));
        expect(patchComposicion.mock.calls[0][0]).toBe("5");
        expect(patchComposicion.mock.calls[0][1]).toMatchObject({ regenerarLineas: true });
    });

    test("detalle: sin permiso de edición no hay botones de acción", async () => {
        localStorage.setItem(
            "whoami",
            JSON.stringify({ empresas: [], plugins: {}, permisos: [{ id_regla: "almacen.composicion", valor: false }] }),
        );
        render(<DetalleComposicion id="5" />);
        await screen.findByText("5 - Kit regalo");
        expect(screen.queryByText("Generar composición", { selector: "button" })).not.toBeInTheDocument();
    });

    test("maestro: lista las composiciones y 'Nueva' abre el alta", async () => {
        render(<MaestroComposicion />);

        expect(await screen.findByRole("heading", { name: "Composiciones de artículos" })).toBeInTheDocument();
        expect(await screen.findByText("Kit regalo")).toBeInTheDocument();

        await userEvent.click(screen.getByText("Nueva"));
        expect(await screen.findByText("Nueva composición")).toBeInTheDocument();
    });
});
