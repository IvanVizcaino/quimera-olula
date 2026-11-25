import { describe, expect, it } from "vitest";
import {
    componentesPorLotes,
    componentesSinTarea,
    criteriaArticulosFabricados,
    fabricacionVacia,
    faltaPorLotes,
    validarFabricacion,
} from "../dominio.ts";
import { cambiosFabricacionAApi, fabricacionDesdeApi } from "../infraestructura.ts";

describe("fabricación del artículo", () => {
    it("un artículo fabricado necesita tipo de proceso", () => {
        expect(validarFabricacion({ fabricado: "true", tipoProcesoId: "" })).not.toBe(true);
        expect(validarFabricacion({ fabricado: "true", tipoProcesoId: "P" })).toBe(true);
        expect(validarFabricacion({ fabricado: "false", tipoProcesoId: "" })).toBe(true);
        expect(validarFabricacion({ fabricado: true, tipoProcesoId: null as unknown as string })).not.toBe(true);
    });

    it("lee el artículo con componentes (ids en texto, sin tarea es vacío) y avisos", () => {
        const a = fabricacionDesdeApi({
            id: "CAMISA", descripcion: "Camisa", fabricado: true, tipo_proceso_id: "P", tipo_proceso: "Proceso",
            sin_stock: false,
            componentes: [
                { id: 1, articulo_id: "TELA", descripcion: "Tela", cantidad: 2, tarea_proceso_id: 7, tarea: "Cortar", codigo_tarea: "P_CORTE" },
                { id: 2, articulo_id: "HILO", descripcion: null, cantidad: null, tarea_proceso_id: null, tarea: null, codigo_tarea: null },
            ],
            avisos: ["El componente HILO no tiene tarea de consumo"],
        });
        expect(a.componentes[0]).toMatchObject({ id: "1", tareaProcesoId: "7", cantidad: 2 });
        expect(a.componentes[1]).toMatchObject({ id: "2", tareaProcesoId: "", descripcion: "", cantidad: 0 });
        expect(componentesSinTarea(a.componentes).map((c) => c.articuloId)).toEqual(["HILO"]);
        expect(a.avisos).toHaveLength(1);
    });

    it("en la lista no hay componentes ni avisos", () => {
        expect(fabricacionDesdeApi({ id: "X", descripcion: null, fabricado: null, tipo_proceso_id: null, tipo_proceso: null }))
            .toEqual({ ...fabricacionVacia(), id: "X" });
    });

    it("manda fabricado como booleano y el tipo vacío como null", () => {
        expect(cambiosFabricacionAApi({ fabricado: "false", tipoProcesoId: "" })).toEqual({ fabricado: false, tipo_proceso_id: null });
        expect(cambiosFabricacionAApi({ fabricado: "true", tipoProcesoId: "P" })).toEqual({ fabricado: true, tipo_proceso_id: "P" });
    });
});

describe("selector de artículos fabricados", () => {
    it("busca por código o descripción entre los fabricados; con id, ese artículo", () => {
        expect(criteriaArticulosFabricados("cam").filtro).toEqual(
            { and: [["fabricado", "=", "true"], { or: [["id", "~", "cam"], ["descripcion", "~", "cam"]] }] });
        expect(criteriaArticulosFabricados("", "CAMISA").filtro).toEqual([["id", "=", "CAMISA"]]);
    });

    it("lee por_lotes del artículo y de cada componente (sin él, falso)", () => {
        const a = fabricacionDesdeApi({
            id: "TELA", descripcion: "Tela", fabricado: true, tipo_proceso_id: "P", tipo_proceso: "Proceso", por_lotes: false,
            componentes: [
                { id: 1, articulo_id: "HILO", descripcion: "Hilo", cantidad: 2, tarea_proceso_id: 7, tarea: "Tejer", codigo_tarea: "T", por_lotes: true },
                { id: 2, articulo_id: "TINTE", descripcion: "Tinte", cantidad: 1, tarea_proceso_id: null, tarea: null, codigo_tarea: null },
            ],
            avisos: ["Debe ir por lotes: tiene componentes por lotes (HILO)"],
        });
        expect(a.porLotes).toBe(false);
        expect(a.componentes.map((c) => c.porLotes)).toEqual([true, false]);
        expect(componentesPorLotes(a.componentes).map((c) => c.articuloId)).toEqual(["HILO"]);
        expect(fabricacionVacia().porLotes).toBe(false);
    });

    it("un fabricado con componentes por lotes tiene que ir por lotes", () => {
        const comp = { id: "1", articuloId: "HILO", descripcion: "", cantidad: 1, tareaProcesoId: "", tarea: "", codigoTarea: "", porLotes: true };
        expect(faltaPorLotes({ fabricado: "true", porLotes: false, componentes: [comp] })).toBe(true);
        expect(faltaPorLotes({ fabricado: true, porLotes: true, componentes: [comp] })).toBe(false);
        expect(faltaPorLotes({ fabricado: false, porLotes: false, componentes: [comp] })).toBe(false);
        expect(faltaPorLotes({ fabricado: true, porLotes: false, componentes: [{ ...comp, porLotes: false }] })).toBe(false);
    });
});
