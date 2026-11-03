import { describe, expect, test } from "vitest";
import {
    cambiosCuentaEspecialAApi,
    cuentaEspecialDesdeApi,
    nuevaCuentaEspecialAApi,
} from "../infraestructura.ts";

describe("cuenta especial infraestructura (co_cuentasesp)", () => {
    test("cuentaEspecialDesdeApi mapea snake_case a dominio", () => {
        expect(
            cuentaEspecialDesdeApi({
                id: "IVASOP",
                descripcion: "IVA SOPORTADO",
                codigo_cuenta: "472",
                codigo_subcuenta: "4720000001",
            }),
        ).toEqual({
            id: "IVASOP",
            descripcion: "IVA SOPORTADO",
            codigoCuenta: "472",
            codigoSubcuenta: "4720000001",
        });
    });

    test("cuentaEspecialDesdeApi convierte los nulos en cadena vacía", () => {
        expect(
            cuentaEspecialDesdeApi({
                id: "CLIENT",
                descripcion: "CLIENTES",
                codigo_cuenta: null,
                codigo_subcuenta: null,
            }),
        ).toMatchObject({
            codigoCuenta: "",
            codigoSubcuenta: "",
        });
    });

    test("nuevaCuentaEspecialAApi omite cuenta y subcuenta si van vacías", () => {
        expect(
            nuevaCuentaEspecialAApi({
                id: "VENTAS",
                descripcion: "VENTAS",
                codigoCuenta: "",
                codigoSubcuenta: "",
            }),
        ).toEqual({
            id: "VENTAS",
            descripcion: "VENTAS",
        });
    });

    test("nuevaCuentaEspecialAApi incluye cuenta y subcuenta si hay valor", () => {
        expect(
            nuevaCuentaEspecialAApi({
                id: "IVAREP",
                descripcion: "IVA REPERCUTIDO",
                codigoCuenta: "477",
                codigoSubcuenta: "4770000001",
            }),
        ).toEqual({
            id: "IVAREP",
            descripcion: "IVA REPERCUTIDO",
            codigo_cuenta: "477",
            codigo_subcuenta: "4770000001",
        });
    });

    test("cambiosCuentaEspecialAApi manda null al vaciar un código", () => {
        expect(cambiosCuentaEspecialAApi({ descripcion: "NUEVA" }))
            .toEqual({ descripcion: "NUEVA" });
        expect(cambiosCuentaEspecialAApi({ codigoSubcuenta: "" }))
            .toEqual({ codigo_subcuenta: null });
        expect(cambiosCuentaEspecialAApi({})).toEqual({});
    });
});
