import { describe, expect, test } from "vitest";
import { cambiosCodigoDescripcion, configCodigoDescripcion, desdeApiCodigoDescripcion } from "../codigo_descripcion.ts";

describe("maestros de código y descripción (Veri*Factu)", () => {
    const config = configCodigoDescripcion({ titulo: "T", nombre: "n", url: "/u", regla: "r" });

    test("desde la API y cambios", () => {
        const r = desdeApiCodigoDescripcion({ id: "REGULAR", descripcion: null });
        expect(r).toEqual({ id: "REGULAR", descripcion: "" });
        expect(cambiosCodigoDescripcion(r, { ...r, descripcion: " General " })).toEqual({ descripcion: "General" });
        expect(cambiosCodigoDescripcion(r, r)).toEqual({});
    });

    test("descripción obligatoria y código de 50", () => {
        expect(config.metaNuevo.campos?.descripcion).toMatchObject({ requerido: true, maximo: 250 });
        expect(config.metaNuevo.campos?.id).toMatchObject({ requerido: true, maximo: 50 });
        expect(config.nuevoAApi({ id: " EXPORT ", descripcion: "Exportación " }))
            .toEqual({ id: "EXPORT", descripcion: "Exportación" });
    });
});
