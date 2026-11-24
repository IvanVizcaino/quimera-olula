import { describe, expect, it } from "vitest";
import { articuloDelTiempo, nuevoTiempoTareaVacio, tareaDelTiempo, validarTiempoTarea } from "../dominio.ts";
import { cambiosTiempoTareaAApi, tiempoTareaDesdeApi } from "../infraestructura.ts";

describe("tiempos de tarea", () => {
    it("exige tipo de centro y tarea; artículo opcional; minutos no negativos", () => {
        const valido = { ...nuevoTiempoTareaVacio, tipoCentroId: "MAQ", tareaProcesoId: "7" };
        expect(validarTiempoTarea(valido)).toBe(true);
        expect(validarTiempoTarea({ ...valido, tipoCentroId: "" })).not.toBe(true);
        expect(validarTiempoTarea({ ...valido, tareaProcesoId: "" })).not.toBe(true);
        expect(validarTiempoTarea({ ...valido, costeUnidad: -1 })).not.toBe(true);
        expect(validarTiempoTarea({ ...valido, articuloId: "x".repeat(23) })).not.toBe(true);
        expect(validarTiempoTarea({ ...valido, articuloId: null as unknown as string })).toBe(true);
    });

    it("lee los ids numéricos como texto", () => {
        const t = tiempoTareaDesdeApi({
            id: 3, tipo_centro_id: "MAQ", tipo_centro: "Máquinas", tarea_proceso_id: 7, tarea: "Cortar",
            codigo_tarea: "P_CORTE", tipo_proceso_id: "P", tipo_proceso: "Proceso", articulo_id: null, articulo: null,
            coste_inicial: 5, coste_unidad: null,
        });
        expect(t).toMatchObject({ id: "3", tareaProcesoId: "7", articuloId: "", costeInicial: 5, costeUnidad: null });
        expect(tareaDelTiempo(t)).toBe("P · P_CORTE - Cortar");
        expect(articuloDelTiempo(t)).toBe("Todos");
        expect(articuloDelTiempo({ articuloId: "A1", articulo: "Camisa" })).toBe("A1 - Camisa");
    });

    it("manda el artículo vacío como null y los minutos como número", () => {
        expect(cambiosTiempoTareaAApi({ tipoCentroId: "MAQ", tareaProcesoId: "7", articuloId: "", costeInicial: null, costeUnidad: 1.5 }))
            .toEqual({ tipo_centro_id: "MAQ", tarea_proceso_id: "7", articulo_id: null, coste_inicial: null, coste_unidad: 1.5 });
    });
});
