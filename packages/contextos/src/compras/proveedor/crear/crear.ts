import { idFiscalCompraValido, tipoIdFiscalCompraValido } from "#/compras/comun/valores.ts";
import { empresaActual } from "#/valores/empresaActual.ts";
import { MetaModelo } from "@olula/lib/dominio.ts";
import { NuevoProveedor } from "../diseño.ts";

export const metaNuevoProveedor: MetaModelo<NuevoProveedor> = {
    campos: {
        nombre: { requerido: true },
        empresaId: { requerido: true },
        tipoIdFiscal: {
            requerido: true,
            validacion: (modelo) => tipoIdFiscalCompraValido(modelo.tipoIdFiscal),
        },
        idFiscal: {
            requerido: true,
            validacion: (modelo) => idFiscalCompraValido(modelo.tipoIdFiscal)(modelo.idFiscal),
        },
    },
};

export const nuevoProveedorInicial = (): NuevoProveedor => ({
    nombre: "",
    idFiscal: "",
    tipoIdFiscal: "NIF",
    empresaId: empresaActual(),
});
