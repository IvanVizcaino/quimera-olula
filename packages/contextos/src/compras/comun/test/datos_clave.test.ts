import { datosClaveDocumentoCompra } from "#/compras/comun/dominio.ts";
import { afterEach, describe, expect, test } from "vitest";

describe("datosClaveDocumentoCompra: Fecha, Proveedor, CIF/NIF y Grupo IVA negocio", () => {
    const documento = {
        fecha: new Date(2026, 10, 5),
        nombreProveedor: "Suministros Pérez S.L.",
        idFiscal: "B12345674",
        grupoIvaNegocioId: "NACIONAL",
        serieId: "A",
        nombreFormaPago: "Contado",
        total: 121,
        divisaId: "EUR",
    };

    const valores = (datos: { etiqueta: string; valor: unknown }[]) =>
        Object.fromEntries(datos.map(({ etiqueta, valor }) => [etiqueta, valor]));

    afterEach(() => localStorage.removeItem("whoami"));

    test("muestra las cuatro etiquetas en orden, sin Forma de pago, Total ni Serie", () => {
        expect(datosClaveDocumentoCompra(documento).map((d) => d.etiqueta)).toEqual([
            "Fecha", "Proveedor", "CIF/NIF", "Grupo IVA negocio",
        ]);
    });

    test("proveedor y CIF/NIF salen del documento", () => {
        const datos = valores(datosClaveDocumentoCompra(documento));
        expect(datos["Proveedor"]).toBe("Suministros Pérez S.L.");
        expect(datos["CIF/NIF"]).toBe("B12345674");
        expect(datos["Fecha"]).toBe("05/11/2026");
    });

    test("el grupo de IVA se muestra con su descripción si se conoce", () => {
        const datos = valores(datosClaveDocumentoCompra(documento, (id) => id === "NACIONAL" ? "Nacional" : undefined));
        expect(datos["Grupo IVA negocio"]).toBe("Nacional");
    });

    test("sin descripción conocida el grupo de IVA se muestra con el código", () => {
        const datos = valores(datosClaveDocumentoCompra(documento, () => undefined));
        expect(datos["Grupo IVA negocio"]).toBe("NACIONAL");
    });

    test("proveedor no registrado: nombre y CIF del documento; vacíos se muestran como guion", () => {
        const datos = valores(datosClaveDocumentoCompra({
            fecha: documento.fecha,
            nombreProveedor: "  ",
            idFiscal: null,
            grupoIvaNegocioId: "",
        }));
        expect(datos["Proveedor"]).toBe("—");
        expect(datos["CIF/NIF"]).toBe("—");
        expect(datos["Grupo IVA negocio"]).toBe("—");
    });

    test("con iva_nav legacy el grupo se sigue mostrando (en compras viene del proveedor)", () => {
        localStorage.setItem("whoami", JSON.stringify({ plugins: { iva_nav: "legacy" } }));
        expect(datosClaveDocumentoCompra(documento).map((d) => d.etiqueta)).toContain("Grupo IVA negocio");
    });
});
