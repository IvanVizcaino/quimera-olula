import { describe, expect, test } from "vitest";
import {
    cambiosCuentaAApi,
    cuentaDesdeApi,
    nuevaCuentaAApi,
} from "../infraestructura.ts";

describe("cuenta infraestructura (CRUD co_cuentas)", () => {
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
            cuentaEspecialId: "",
            esIva: false,
        });
    });

    test("cuentaDesdeApi trae el tipo especial y si es de IVA", () => {
        expect(
            cuentaDesdeApi({
                id: 7,
                codigo: "472",
                nombre: "IVA SOPORTADO",
                ejercicio_id: "2026",
                codigo_epigrafe: "47",
                nivel: 3,
                cuenta_especial_id: "IVASOP",
                es_iva: true,
            }),
        ).toMatchObject({
            cuentaEspecialId: "IVASOP",
            esIva: true,
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
