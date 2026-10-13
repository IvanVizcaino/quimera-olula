import { describe, expect, test } from "vitest";
import { getMaquina as getMaquinaDetalle } from "../detalle/maquina.ts";
import { getMaquina as getMaquinaMaestro } from "../maestro/maquina.ts";

describe("composicion máquinas (T2.6)", () => {
    test("detalle: generar y borrar pasan por confirmación y se pueden cancelar", () => {
        const m = getMaquinaDetalle();
        expect(m.Editando.generar_solicitada).toBe("Generando");
        expect(m.Generando.generacion_cancelada).toBe("Editando");
        expect(m.Generando.composicion_generada).toEqual([expect.any(Function)]);
        expect(m.Editando.borrar).toBe("Borrando");
        expect(m.Borrando.borrado_cancelado).toBe("Editando");
    });

    test("detalle: guardar refresca y avisa al maestro", () => {
        const m = getMaquinaDetalle();
        expect(m.Editando.composicion_guardada).toEqual([expect.any(Function)]);
        expect(m.INICIAL.composicion_id_cambiado).toEqual([expect.any(Function)]);
    });

    test("maestro: crear abre el alta y composicion_creada vuelve a INICIAL", () => {
        const m = getMaquinaMaestro();
        expect(m.INICIAL.crear).toBe("CREANDO");
        expect(m.CREANDO.creacion_cancelada).toBe("INICIAL");
        expect(m.CREANDO.composicion_creada).toEqual([expect.any(Function), "INICIAL"]);
    });
});
