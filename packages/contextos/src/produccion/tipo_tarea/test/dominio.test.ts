import { describe, expect, it } from "vitest";
import { nuevoTipoTareaVacio, validarTipoTarea } from "../dominio.ts";
import { cambiosTipoTareaAApi, tipoTareaDesdeApi } from "../infraestructura.ts";

describe("tipos de tarea", () => {
    it("exige código (hasta 20) y descripción, y un tiempo no negativo", () => {
        const valido = { ...nuevoTipoTareaVacio, id: "CORTE", descripcion: "Corte" };
        expect(validarTipoTarea(valido)).toBe(true);
        expect(validarTipoTarea({ ...valido, id: "x".repeat(21) })).not.toBe(true);
        expect(validarTipoTarea({ ...valido, descripcion: "" })).not.toBe(true);
        expect(validarTipoTarea({ ...valido, tiempoMedio: -1 })).not.toBe(true);
        expect(validarTipoTarea({ ...valido, tiempoMedio: 12.5 })).toBe(true);
    });

    it("lee y manda el tiempo medio (vacío es 0 en la API)", () => {
        expect(tipoTareaDesdeApi({ id: "C", descripcion: null, tiempo_medio: null }))
            .toEqual({ id: "C", descripcion: "", tiempoMedio: null });
        expect(cambiosTipoTareaAApi({ descripcion: "Corte", tiempoMedio: null }))
            .toEqual({ descripcion: "Corte", tiempo_medio: 0 });
        expect(cambiosTipoTareaAApi({ tiempoMedio: 30 })).toEqual({ tiempo_medio: 30 });
    });
});
