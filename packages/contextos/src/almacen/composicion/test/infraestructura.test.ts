import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { afterEach, describe, expect, test, vi } from "vitest";
import {
    cambiosAApiParaTest,
    composicionDesdeApiParaTest,
    deleteComposicion,
    patchComposicion,
    postComposicion,
} from "../infraestructura.ts";

afterEach(() => vi.restoreAllMocks());

describe("composicion infraestructura (T2.6)", () => {
    test("composicionDesdeApi mapea cabecera, líneas e ids numéricos", () => {
        const c = composicionDesdeApiParaTest({
            id: 12,
            fecha: "2026-10-08",
            hora: "09:30:00",
            almacen_id: "ALG",
            articulo_id: "KIT",
            descripcion: "Kit café",
            cantidad: 3,
            usuario_id: "admin",
            lineas: [
                { id: 5, articulo_id: "CAFE", descripcion: "Café", cantidad: 6, almacen_id: "ALG" },
            ],
        });
        expect(c).toEqual({
            id: "12",
            fecha: "2026-10-08",
            hora: "09:30",
            almacenId: "ALG",
            articuloId: "KIT",
            descripcion: "Kit café",
            cantidad: 3,
            usuarioId: "admin",
            lineas: [
                { id: "5", articuloId: "CAFE", descripcion: "Café", cantidad: 6, almacenId: "ALG" },
            ],
        });
    });

    test("composicionDesdeApi acepta ISO completo y listado sin líneas", () => {
        const c = composicionDesdeApiParaTest({
            id: 1,
            fecha: "2026-10-08T00:00:00",
            hora: "1970-01-01T14:05:00",
            almacen_id: "A",
            articulo_id: "K",
            descripcion: null,
            cantidad: 1,
            usuario_id: "u",
        });
        expect(c.fecha).toBe("2026-10-08");
        expect(c.hora).toBe("14:05");
        expect(c.descripcion).toBe("");
        expect(c.lineas).toEqual([]);
    });

    test("cambiosAApi: solo lo informado; línea sin id es alta; regenerar_lineas solo si true", () => {
        expect(cambiosAApiParaTest({ cantidad: 2 })).toEqual({ cantidad: 2 });
        expect(
            cambiosAApiParaTest({
                lineas: [
                    { id: "5", articuloId: "A", cantidad: 1, almacenId: "ALG" },
                    { id: "", articuloId: "B", cantidad: 2, almacenId: "ALG" },
                ],
            }),
        ).toEqual({
            lineas: [
                { id: 5, articulo_id: "A", cantidad: 1, almacen_id: "ALG" },
                { articulo_id: "B", cantidad: 2, almacen_id: "ALG" },
            ],
        });
        expect(cambiosAApiParaTest({ cantidad: 4, regenerarLineas: true })).toEqual({
            cantidad: 4,
            regenerar_lineas: true,
        });
        expect(cambiosAApiParaTest({ regenerarLineas: false })).toEqual({});
    });

    test("postComposicion no envía líneas (el backend las genera) y devuelve el id", async () => {
        const post = vi.spyOn(RestAPI, "post").mockResolvedValue({ id: "9" });
        const id = await postComposicion({
            almacenId: "ALG",
            articuloId: "KIT",
            cantidad: 2,
            fecha: "2026-10-08",
            hora: "10:00",
        });
        expect(id).toBe("9");
        expect(post).toHaveBeenCalledWith(
            "/almacen/composicion",
            { almacen_id: "ALG", articulo_id: "KIT", cantidad: 2, fecha: "2026-10-08", hora: "10:00" },
            expect.any(String),
        );
    });

    test("patch y delete usan /almacen/composicion/<id>", async () => {
        const patch = vi.spyOn(RestAPI, "patch").mockResolvedValue(undefined);
        const borrar = vi.spyOn(RestAPI, "delete").mockResolvedValue(undefined);
        await patchComposicion("9", { regenerarLineas: true, cantidad: 5 });
        await deleteComposicion("9");
        expect(patch).toHaveBeenCalledWith(
            "/almacen/composicion/9",
            { cantidad: 5, regenerar_lineas: true },
            expect.any(String),
        );
        expect(borrar).toHaveBeenCalledWith("/almacen/composicion/9", expect.any(String));
    });
});
