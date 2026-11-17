import { describe, expect, test } from "vitest";
import { cambiosGrupo } from "../detalle/detalle.ts";
import { grupoContableAmortizacionVacio } from "../dominio.ts";
import { cambiosGrupoAApi, grupoDesdeApi, nuevoGrupoAApi } from "../infraestructura.ts";

describe("grupos contables de amortización (co_gruposcontablesamo)", () => {
    test("grupoDesdeApi convierte nulos en vacío y agrupa los nombres de subcuenta", () => {
        const grupo = grupoDesdeApi({
            id: "MAQ",
            descripcion: null,
            subcuenta_elemento: "2130000000",
            descripcion_subcuenta_elemento: "Maquinaria",
            subcuenta_amortizacion: "2813000000",
            descripcion_subcuenta_amortizacion: null,
            subcuenta_gasto: "6810000000",
            descripcion_subcuenta_gasto: "Amortización inmovilizado material",
            subcuenta_perdidas: "6710000000",
            descripcion_subcuenta_perdidas: null,
            subcuenta_ganancias: "7710000000",
            descripcion_subcuenta_ganancias: null,
        });
        expect(grupo.descripcion).toBe("");
        expect(grupo.subcuentaGasto).toBe("6810000000");
        expect(grupo.descripcionesSubcuentas.elemento).toBe("Maquinaria");
        expect(grupo.descripcionesSubcuentas.amortizacion).toBe("");
    });

    test("cambiosGrupoAApi solo manda lo cambiado y la descripción vacía como null", () => {
        expect(cambiosGrupoAApi({ descripcion: " ", subcuentaGasto: " 681.1 " })).toEqual({
            descripcion: null,
            subcuenta_gasto: "681.1",
        });
    });

    test("nuevoGrupoAApi lleva el ejercicio actual para completar las subcuentas", () => {
        const api = nuevoGrupoAApi({
            id: " MAQ ", descripcion: "Maquinaria",
            subcuentaElemento: "213", subcuentaAmortizacion: "2813",
            subcuentaGasto: "681", subcuentaPerdidas: "671", subcuentaGanancias: "771",
        }, "2026");
        expect(api).toMatchObject({ id: "MAQ", ejercicio_id: "2026", subcuenta_perdidas: "671" });
    });

    test("cambiosGrupo detecta solo los campos editados", () => {
        const previo = { ...grupoContableAmortizacionVacio(), id: "MAQ", subcuentaGasto: "6810000000" };
        expect(cambiosGrupo(previo, { ...previo, subcuentaGasto: "6810000001" })).toEqual({
            subcuentaGasto: "6810000001",
        });
    });
});
