import { tieneDireccionFacturacion } from "../cambiar_cliente.ts";

describe("tieneDireccionFacturacion", () => {

    test("un cliente sin direcciones no tiene dirección de facturación", () => {
        expect(tieneDireccionFacturacion([])).toBe(false);
    });

    test("un cliente solo con direcciones que no son de facturación no tiene dirección de facturación", () => {
        expect(tieneDireccionFacturacion([{ dir_facturacion: false }])).toBe(false);
    });

    test("un cliente con alguna dirección de facturación la tiene", () => {
        expect(tieneDireccionFacturacion([
            { dir_facturacion: false },
            { dir_facturacion: true },
        ])).toBe(true);
    });
});
