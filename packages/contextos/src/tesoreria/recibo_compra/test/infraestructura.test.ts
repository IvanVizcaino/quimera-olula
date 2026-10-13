import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { describe, expect, test, vi } from "vitest";
import {
    patchAnularPagoReciboCompra,
    patchDevolverReciboCompra,
    patchPagarReciboCompra,
    reciboCompraDesdeApi,
} from "../infraestructura.js";

describe("recibo_compra infraestructura", () => {
    test("reciboCompraDesdeApi mapea pagos del GET por id", () => {
        const recibo = reciboCompraDesdeApi({
            id: "42",
            factura_id: "F1",
            codigo: "RP-42",
            fecha_emision: "2026-01-01",
            fecha_vencimiento: "2026-02-01",
            estado: "Pagado",
            importe: 150.5,
            proveedor_id: "P1",
            nombre_proveedor: "Proveedor SL",
            id_fiscal: "B12345678",
            pagos: [
                {
                    id: "M1",
                    fecha: "2026-01-15",
                    tipo: "Pago",
                    estado: true,
                    cuenta_pago_id: "CB1",
                    nombre_cuenta_pago: "Caja",
                },
            ],
        });

        expect(recibo.nombreProveedor).toBe("Proveedor SL");
        expect(recibo.pagos).toHaveLength(1);
        expect(recibo.pagos[0].cuentaPagoId).toBe("CB1");
        expect(recibo.pagos[0].fecha?.toISOString().slice(0, 10)).toBe("2026-01-15");
    });

    test("patchPagarReciboCompra llama PATCH …/pagar", async () => {
        const patch = vi.spyOn(RestAPI, "patch").mockResolvedValue(undefined);

        await patchPagarReciboCompra("42", {
            cuentaPagoId: "CB1",
            fecha: "2026-03-01",
        });

        expect(patch).toHaveBeenCalledWith(
            expect.stringMatching(/\/tesoreria\/recibo_pago\/42\/pagar$/),
            { cuenta_pago_id: "CB1", fecha: "2026-03-01", iban: null, numero_cheque: null },
            "Error al pagar el recibo de pago"
        );

        patch.mockRestore();
    });

    test("patchDevolverReciboCompra llama PATCH …/devolver", async () => {
        const patch = vi.spyOn(RestAPI, "patch").mockResolvedValue(undefined);

        await patchDevolverReciboCompra("42", {
            cuentaPagoId: "CB1",
            fecha: "2026-03-02",
        });

        expect(patch).toHaveBeenCalledWith(
            expect.stringMatching(/\/tesoreria\/recibo_pago\/42\/devolver$/),
            { cuenta_pago_id: "CB1", fecha: "2026-03-02", iban: null, numero_cheque: null },
            "Error al devolver el recibo de pago"
        );

        patch.mockRestore();
    });

    test("patchAnularPagoReciboCompra llama PATCH …/anular_pago", async () => {
        const patch = vi.spyOn(RestAPI, "patch").mockResolvedValue(undefined);

        await patchAnularPagoReciboCompra("42", "M9");

        expect(patch).toHaveBeenCalledWith(
            expect.stringMatching(/\/tesoreria\/recibo_pago\/42\/anular_pago$/),
            { pago_id: "M9" },
            "Error al anular el pago del recibo"
        );

        patch.mockRestore();
    });
});
