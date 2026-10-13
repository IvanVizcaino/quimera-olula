import { describe, expect, test } from "vitest";
import {
    cambiosCuentaAApi,
    cuentaDesdeApi,
    nuevaCuentaAApi,
} from "../infraestructura.ts";

describe("cuenta infraestructura (T6.4 / F-03 CRUD co_cuentas)", () => {
    test("cuentaDesdeApi mapea snake_case a dominio", () => {
        expect(
            cuentaDesdeApi({
                id: 99,
                codigo: "430",
                nombre: "CLIENTES",
                ejercicio_id: "2026",
                codigo_epigrafe: "43",
                nivel: 3,
            }),
        ).toEqual({
            id: "99",
            codigo: "430",
            nombre: "CLIENTES",
            ejercicioId: "2026",
            codigoEpigrafe: "43",
            nivel: 3,
        });
    });

    test("nuevaCuentaAApi y cambiosCuentaAApi", () => {
        expect(
            nuevaCuentaAApi({
                codigo: "430",
                nombre: "CLIENTES",
                codigoEpigrafe: "43",
                ejercicioId: "2026",
            }),
        ).toEqual({
            codigo: "430",
            nombre: "CLIENTES",
            codigo_epigrafe: "43",
            ejercicio_id: "2026",
        });
        expect(cambiosCuentaAApi({ nombre: "NUEVO" })).toEqual({ nombre: "NUEVO" });
        expect(cambiosCuentaAApi({})).toEqual({});
    });
});
