import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

const postUnidadMedida = vi.fn();
const getUnidadMedida = vi.fn();

vi.mock("../infraestructura.ts", () => ({
    postUnidadMedida: (...a: unknown[]) => postUnidadMedida(...a),
    getUnidadMedida: (...a: unknown[]) => getUnidadMedida(...a),
}));

const { CrearUnidadMedida } = await import("../crear/CrearUnidadMedida.tsx");

const inputDe = (nombre: string) =>
    document.querySelector(`quimera-input[nombre="${nombre}"] input`) as HTMLInputElement;

describe("CrearUnidadMedida", () => {
    beforeEach(() => {
        postUnidadMedida.mockReset().mockResolvedValue("KG");
        getUnidadMedida.mockReset().mockResolvedValue({ id: "KG" });
        HTMLDialogElement.prototype.showModal = vi.fn();
        HTMLDialogElement.prototype.close = vi.fn();
    });

    test("lo escrito en el formulario se conserva entre renders", async () => {
        render(<CrearUnidadMedida activo={true} />);
        await userEvent.type(inputDe("id"), "KG");
        expect(inputDe("id").value).toBe("KG");
        await userEvent.type(inputDe("descripcion"), "Kilogramo");
        expect(inputDe("id").value).toBe("KG");
        expect(inputDe("descripcion").value).toBe("Kilogramo");
    });

    test("crear envía lo escrito y publica unidad_creada", async () => {
        const publicar = vi.fn();
        render(<CrearUnidadMedida activo={true} publicar={publicar} />);
        await userEvent.type(inputDe("id"), "KG");
        await userEvent.type(inputDe("descripcion"), "Kilogramo");
        await userEvent.click(screen.getByText("Guardar"));
        expect(postUnidadMedida).toHaveBeenCalledTimes(1);
        expect(postUnidadMedida.mock.calls[0][0]).toMatchObject({ id: "KG", descripcion: "Kilogramo" });
        expect(publicar).toHaveBeenCalledWith("unidad_creada", { id: "KG" });
    });
});
