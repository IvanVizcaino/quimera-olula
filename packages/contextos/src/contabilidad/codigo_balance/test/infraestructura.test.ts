import { describe, expect, test } from "vitest";
import {
    cambiosCodigoBalanceAApi,
    codigoBalanceDesdeApi,
    cuentaCodigoBalanceAApi,
    cuentaCodigoBalanceDesdeApi,
    nuevoCodigoBalanceAApi,
} from "../infraestructura.ts";

describe("códigos de balance 2008 (co_codbalances08)", () => {
    test("codigoBalanceDesdeApi convierte nulos en vacío y nivel2 en texto", () => {
        expect(
            codigoBalanceDesdeApi({
                id: "P-A-1-I-2",
                naturaleza: "P",
                nivel1: "A",
                descripcion1: "A) PATRIMONIO NETO",
                nivel2: 1,
                descripcion2: "A-1) Fondos propios.",
                nivel3: "I",
                orden3: "1",
                descripcion3: "I. Capital.",
                nivel4: "2",
                descripcion4: "2. (Capital no exigido).",
                descripcion4ba: null,
            })
        ).toMatchObject({ nivel2: "1", orden3: "1", descripcion4ba: "" });
    });

    test("cambiosCodigoBalanceAApi manda null en los vacíos y nivel2 numérico", () => {
        expect(
            cambiosCodigoBalanceAApi({ nivel2: "3", nivel3: " ", descripcion4ba: "1. Proveedores" })
        ).toEqual({ nivel2: 3, nivel3: null, descripcion4ba: "1. Proveedores" });
        expect(cambiosCodigoBalanceAApi({ nivel2: "" })).toEqual({ nivel2: null });
    });

    test("nuevoCodigoBalanceAApi incluye el código", () => {
        expect(
            nuevoCodigoBalanceAApi({
                id: " X-1 ", naturaleza: "A", nivel1: "", descripcion1: "", nivel2: "",
                descripcion2: "", nivel3: "", descripcion3: "", nivel4: "",
                descripcion4: "Nuevo", descripcion4ba: "",
            })
        ).toMatchObject({ id: "X-1", naturaleza: "A", nivel1: null, descripcion4: "Nuevo" });
    });
});

describe("cuentas por código de balance (co_cuentascb / co_cuentascbba)", () => {
    test("cuentaCodigoBalanceDesdeApi", () => {
        expect(
            cuentaCodigoBalanceDesdeApi({
                id: 7,
                formato: "abreviado",
                codigo_balance_id: "A-A--I-1",
                codigo_cuenta: "20",
                descripcion_cuenta: null,
                signo: "Ambos",
            })
        ).toEqual({
            id: "7",
            formato: "abreviado",
            codigoBalanceId: "A-A--I-1",
            codigoCuenta: "20",
            descripcionCuenta: "",
            signo: "Ambos",
        });
    });

    test("cuentaCodigoBalanceAApi solo manda lo informado", () => {
        expect(cuentaCodigoBalanceAApi({ signo: "Negativo" })).toEqual({ signo: "Negativo" });
        expect(
            cuentaCodigoBalanceAApi({ codigoCuenta: " 5523 ", descripcionCuenta: "", signo: "Positivo" })
        ).toEqual({ codigo_cuenta: "5523", descripcion_cuenta: null, signo: "Positivo" });
    });
});
