import { describe, expect, it } from "vitest";
import { nuevoTrabajadorVacio, seccionesSinAsignar, validarTrabajador } from "../dominio.ts";
import { cambiosTrabajadorAApi, trabajadorDesdeApi } from "../infraestructura.ts";

describe("trabajadores", () => {
    it("exige código (hasta 30) y nombre", () => {
        expect(validarTrabajador({ ...nuevoTrabajadorVacio, id: "T1", nombre: "Ana" })).toBe(true);
        expect(validarTrabajador({ ...nuevoTrabajadorVacio, id: "", nombre: "Ana" })).not.toBe(true);
        expect(validarTrabajador({ ...nuevoTrabajadorVacio, id: "x".repeat(31), nombre: "Ana" })).not.toBe(true);
        expect(validarTrabajador({ ...nuevoTrabajadorVacio, id: "T1", nombre: null as unknown as string })).not.toBe(true);
    });

    it("lee el trabajador con sus secciones", () => {
        expect(trabajadorDesdeApi({
            id: "T1", nombre: "Ana", seccion_id: "S1", seccion: "Corte", de_baja: false,
            secciones: [{ seccion_id: "S1", descripcion: "Corte", principal: true }],
        })).toEqual({
            id: "T1", nombre: "Ana", seccionId: "S1", seccion: "Corte", deBaja: false,
            secciones: [{ seccionId: "S1", descripcion: "Corte", principal: true }],
        });
        expect(trabajadorDesdeApi({ id: "T2", nombre: "Luis", seccion_id: null, seccion: null, de_baja: true }).secciones)
            .toEqual([]);
    });

    it("manda la baja como booleano aunque el checkbox dé texto y la sección vacía como null", () => {
        expect(cambiosTrabajadorAApi({ deBaja: "true", seccionId: "" })).toEqual({ de_baja: true, seccion_id: null });
        expect(cambiosTrabajadorAApi({ deBaja: "false" })).toEqual({ de_baja: false });
    });

    it("ofrece solo las secciones que no tiene", () => {
        const opciones = [{ valor: "S1", descripcion: "S1" }, { valor: "S2", descripcion: "S2" }];
        expect(seccionesSinAsignar(opciones, [{ seccionId: "S1", descripcion: "", principal: true }]))
            .toEqual([{ valor: "S2", descripcion: "S2" }]);
    });
});
