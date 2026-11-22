import { describe, expect, test, vi } from "vitest";
import { camposCambiados } from "../dominio.ts";
import { conConfirmacion } from "../maestro/infraestructura.ts";

describe("maestros de Fiscalidad", () => {
    test("camposCambiados solo devuelve lo cambiado, con su nombre de API", () => {
        expect(camposCambiados({ a: 1, b: "x" }, { a: 2, b: "x" }, [["a", "campo_a"], ["b", "campo_b"]]))
            .toEqual({ campo_a: 2 });
    });

    test("conConfirmacion repite con el campo de confirmación si se acepta el 409", async () => {
        const guardar = vi.fn()
            .mockRejectedValueOnce({ estado: 409, descripcion: "La subcuenta no está asociada" })
            .mockResolvedValueOnce("GEN");
        const resultado = await conConfirmacion(
            guardar, { campo: "asociar", pregunta: "¿Asociar?" }, () => true);
        expect(resultado).toBe("GEN");
        expect(guardar).toHaveBeenLastCalledWith({ asociar: true });
    });

    test("conConfirmacion no repite si se rechaza y deja pasar otros errores", async () => {
        const conflicto = vi.fn().mockRejectedValue({ estado: 409 });
        expect(await conConfirmacion(conflicto, { campo: "asociar", pregunta: "?" }, () => false))
            .toBeUndefined();
        const otro = vi.fn().mockRejectedValue({ estado: 400 });
        await expect(conConfirmacion(otro, { campo: "asociar", pregunta: "?" }, () => true))
            .rejects.toEqual({ estado: 400 });
    });
});
