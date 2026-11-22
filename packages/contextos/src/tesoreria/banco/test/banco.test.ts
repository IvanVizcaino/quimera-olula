import { describe, expect, test } from "vitest";
import { cambiosBanco } from "../detalle/detalle.ts";
import { bancoVacio, cambiosSucursal, datosSucursalVacios, metaNuevoBanco, metaSucursal, nuevoBancoVacio } from "../dominio.ts";
import { bancoDesdeApi, cambiosBancoAApi, cambiosSucursalAApi, nuevoBancoAApi } from "../infraestructura.ts";

describe("bancos y sucursales (bancos, sucursales)", () => {
    test("bancoDesdeApi convierte nulos y sucursales", () => {
        const banco = bancoDesdeApi({
            id: "2100", nombre: "CaixaBank", proveedor_id: null, nombre_proveedor: null,
            bic_defecto: "CAIXESBBXXX",
            sucursales: [{
                id: 7, agencia: "0001", nombre: null, direccion: null, codigo_postal: null,
                apartado: null, poblacion: "Madrid", provincia_id: null, provincia: null,
                pais_id: "ES", telefono: null, fax: null, contacto: null, observaciones: null,
            }],
        });
        expect(banco.proveedorId).toBe("");
        expect(banco.sucursales[0]).toMatchObject({ id: "7", agencia: "0001", poblacion: "Madrid", nombre: "" });
    });

    test("cambios a la API: vacíos como null", () => {
        expect(cambiosBancoAApi({ proveedorId: " ", bicDefecto: "X" })).toEqual({ proveedor_id: null, bic_defecto: "X" });
        expect(cambiosSucursalAApi({ codigoPostal: "28001", fax: "" })).toEqual({ codigo_postal: "28001", fax: null });
        expect(nuevoBancoAApi({ ...nuevoBancoVacio(), id: " 2100 ", nombre: "X" })).toMatchObject({ id: "2100", nombre: "X" });
    });

    test("entidad y oficina de 4 dígitos (regexp del .mtd)", () => {
        const validarEntidad = metaNuevoBanco.campos!.id.validacion!;
        expect(validarEntidad({ ...nuevoBancoVacio(), id: "2100" })).toBe(true);
        expect(validarEntidad({ ...nuevoBancoVacio(), id: "21A0" })).toMatch(/4 dígitos/);
        const validarOficina = metaSucursal.campos!.agencia.validacion!;
        expect(validarOficina({ ...datosSucursalVacios(), agencia: "123" })).toMatch(/4 dígitos/);
    });

    test("cambiosBanco y cambiosSucursal detectan solo lo editado", () => {
        const previo = { ...bancoVacio(), id: "2100", nombre: "A" };
        expect(cambiosBanco(previo, { ...previo, nombre: "B" })).toEqual({ nombre: "B" });
        const sucursal = { ...datosSucursalVacios(), id: "1", agencia: "0001" };
        expect(cambiosSucursal(sucursal, { ...datosSucursalVacios(), agencia: "0001", telefono: "9" })).toEqual({ telefono: "9" });
    });
});
