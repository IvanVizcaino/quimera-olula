import { remesaPagoInicial } from "#/tesoreria/remesa_pago/detalle/detalle.ts";
import { pagoRemesaPagoInicial } from "#/tesoreria/remesa_pago/detalle/pagar/dominio.ts";
import { RemesaPago } from "#/tesoreria/remesa_pago/diseño.ts";
import {
    esRemesaDeNominas,
    fechaIso,
    remesaPagoConPago,
    remesaPagoPagable,
    varianteEstadoRemesaPago,
} from "#/tesoreria/remesa_pago/dominio.ts";

const remesa = (cambios: Partial<RemesaPago> = {}): RemesaPago => ({
    ...remesaPagoInicial(),
    id: "7",
    estado: "Emitida",
    ...cambios,
});

describe("remesa de pago", () => {

    test("sin pagos se puede pagar; con uno, solo deshacerlo", () => {
        expect(remesaPagoPagable(remesa(), () => false)).toBe(true);
        expect(remesaPagoConPago(remesa())).toBe(false);

        const pagada = remesa({ estado: "Pagada", pagos: [{ id: "1", fecha: new Date() }] });
        expect(remesaPagoPagable(pagada)).toBe(false);
        expect(remesaPagoConPago(pagada)).toBe(true);
    });

    test("con pago directo una remesa de recibos no se paga; una de nóminas, sí", () => {
        const directo = () => true;
        const diferido = () => false;

        expect(remesaPagoPagable(remesa({ tipo: "Recibos" }), directo)).toBe(false);
        expect(remesaPagoPagable(remesa({ tipo: "Nóminas" }), directo)).toBe(true);
        expect(remesaPagoPagable(remesa({ tipo: "Recibos" }), diferido)).toBe(true);
    });

    test("una remesa sin id no se paga", () => {
        expect(remesaPagoPagable(remesa({ id: "" }), () => false)).toBe(false);
    });

    test("distingue las remesas de nóminas", () => {
        expect(esRemesaDeNominas(remesa({ tipo: "Nóminas" }))).toBe(true);
        expect(esRemesaDeNominas(remesa({ tipo: "Recibos" }))).toBe(false);
    });

    test("variante del estado", () => {
        expect(varianteEstadoRemesaPago("Pagada")).toBe("exito");
        expect(varianteEstadoRemesaPago(" emitida ")).toBe("neutro");
        expect(varianteEstadoRemesaPago("otro")).toBe("neutro");
    });

    test("la fecha va en ISO local, sin desplazarse a UTC", () => {
        expect(fechaIso(new Date(2026, 0, 1, 0, 30))).toBe("2026-01-01");
    });

    test("al pagar se propone la fecha prevista si es futura y si no, hoy", () => {
        const futura = new Date(Date.now() + 5 * 24 * 3600 * 1000);
        expect(pagoRemesaPagoInicial(futura).fecha).toBe(futura);

        const pasada = new Date(2000, 0, 1);
        expect(fechaIso(pagoRemesaPagoInicial(pasada).fecha)).toBe(fechaIso(new Date()));
        expect(fechaIso(pagoRemesaPagoInicial(null).fecha)).toBe(fechaIso(new Date()));
    });
});
