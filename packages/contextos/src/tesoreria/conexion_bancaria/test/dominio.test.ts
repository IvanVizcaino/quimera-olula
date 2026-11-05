import { ConexionBancaria, CuentaConexionBancaria } from "#/tesoreria/conexion_bancaria/diseño.ts";
import {
    conexionBancariaVacia,
    conTipoProducto,
    esPrestamo,
    tiposProductoSinLeer,
} from "#/tesoreria/conexion_bancaria/dominio.ts";
import { describe, expect, test } from "vitest";

const cuenta = (tipo: string): CuentaConexionBancaria => ({
    id: tipo, idExterno: `${tipo}:1`, nombre: tipo, mascara: null, tipo, subtipo: null, iban: null,
    cuentaBancoId: null, descripcionCuentaBanco: null, activa: true,
});

const conexion = (cambios: Partial<ConexionBancaria>): ConexionBancaria => ({
    ...conexionBancariaVacia, id: "c1", ...cambios,
});

describe("productos de la conexión", () => {
    test("los tipos se mantienen en orden y sin repetir", () => {
        expect(conTipoProducto(["accounts"], "loans", true)).toEqual(["accounts", "loans"]);
        expect(conTipoProducto(["accounts", "loans"], "accounts", false)).toEqual(["loans"]);
        expect(conTipoProducto(["loans"], "loans", true)).toEqual(["loans"]);
    });

    test("préstamos pedidos que el banco todavía no ha devuelto", () => {
        expect(tiposProductoSinLeer(conexion({ tiposProducto: ["accounts", "loans"], cuentas: [cuenta("accounts")] })))
            .toEqual(["loans"]);
        expect(tiposProductoSinLeer(conexion({
            tiposProducto: ["accounts", "loans"], cuentas: [cuenta("accounts"), cuenta("loans")],
        }))).toEqual([]);
    });

    test("un préstamo no es una cuenta que se asocie a la empresa", () => {
        expect(esPrestamo(cuenta("loans"))).toBe(true);
        expect(esPrestamo(cuenta("accounts"))).toBe(false);
    });
});
