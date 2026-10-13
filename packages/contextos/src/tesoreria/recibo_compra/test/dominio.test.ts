import { MovimientoReciboCompra, ReciboCompra } from "#/tesoreria/recibo_compra/diseño.ts";
import {
    cuentaUltimoPagoCompra,
    reciboCompraAnulable,
    reciboCompraDevolvible,
    reciboCompraPagable,
    ultimoPagoCompra,
} from "#/tesoreria/recibo_compra/dominio.ts";
import { reciboCompraInicial } from "#/tesoreria/recibo_compra/detalle/detalle.ts";
import { describe, expect, test } from "vitest";

const conEstado = (estado: string): ReciboCompra => ({
    ...reciboCompraInicial(),
    estado,
});

const movimiento = (
    fecha: string,
    tipo: string,
    cuentaPagoId: string,
    estado = true
): MovimientoReciboCompra => ({
    id: `${tipo}-${fecha}`,
    fecha: new Date(fecha),
    tipo,
    estado,
    cuentaPagoId,
    nombreCuentaPago: `Cuenta ${cuentaPagoId}`,
});

const conPagos = (estado: string, pagos: MovimientoReciboCompra[]): ReciboCompra => ({
    ...reciboCompraInicial(),
    estado,
    pagos,
});

describe("solo se paga un recibo emitido o devuelto", () => {
    test("emitido y devuelto se pagan", () => {
        expect(reciboCompraPagable(conEstado("Emitido"))).toBe(true);
        expect(reciboCompraPagable(conEstado("Devuelto"))).toBe(true);
    });

    test("pagado no admite pago", () => {
        expect(reciboCompraPagable(conEstado("Pagado"))).toBe(false);
    });

    test("un recibo sin cargar no es pagable", () => {
        expect(reciboCompraPagable(reciboCompraInicial())).toBe(false);
    });

    test("da igual cómo lo escriba el servidor", () => {
        expect(reciboCompraPagable(conEstado(" EMITIDO "))).toBe(true);
        expect(reciboCompraPagable(conEstado("devuelto"))).toBe(true);
    });
});

describe("solo se devuelve un recibo pagado", () => {
    test("pagado se devuelve", () => {
        expect(reciboCompraDevolvible(conEstado("Pagado"))).toBe(true);
        expect(reciboCompraDevolvible(conEstado(" PAGADO "))).toBe(true);
    });

    test("emitido o devuelto no se devuelven", () => {
        expect(reciboCompraDevolvible(conEstado("Emitido"))).toBe(false);
        expect(reciboCompraDevolvible(conEstado("Devuelto"))).toBe(false);
    });
});

describe("solo se puede anular el pago de un recibo pagado con pagos conocidos", () => {
    test("pagado con pagos sí se puede anular", () => {
        const recibo = conPagos("Pagado", [movimiento("2026-01-10", "Pago", "A")]);
        expect(reciboCompraAnulable(recibo)).toBe(true);
    });

    test("pagado sin pagos conocidos no se puede anular (backend gap)", () => {
        expect(reciboCompraAnulable(conEstado("Pagado"))).toBe(false);
    });

    test("emitido no se puede anular", () => {
        const recibo = conPagos("Emitido", [movimiento("2026-01-10", "Pago", "A")]);
        expect(reciboCompraAnulable(recibo)).toBe(false);
    });
});

describe("la devolución sale por la cuenta del último pago", () => {
    test("toma el pago más reciente que no sea devolución", () => {
        const recibo = conPagos("Pagado", [
            movimiento("2026-01-10", "Pago", "A"),
            movimiento("2026-02-10", "Devolución", "A"),
            movimiento("2026-03-10", "Pago", "B"),
        ]);
        expect(cuentaUltimoPagoCompra(recibo)).toEqual({ id: "B", nombre: "Cuenta B" });
    });

    test("sin pagos no hay cuenta", () => {
        expect(cuentaUltimoPagoCompra(reciboCompraInicial())).toBeNull();
    });
});

describe("ultimoPagoCompra devuelve el último movimiento cronológicamente", () => {
    test("devuelve el más reciente", () => {
        const recibo = conPagos("Pagado", [
            movimiento("2026-01-10", "Pago", "A"),
            movimiento("2026-03-10", "Pago", "B"),
        ]);
        const ultimo = ultimoPagoCompra(recibo);
        expect(ultimo?.id).toBe("Pago-2026-03-10");
    });

    test("sin pagos devuelve null", () => {
        expect(ultimoPagoCompra(reciboCompraInicial())).toBeNull();
    });
});
