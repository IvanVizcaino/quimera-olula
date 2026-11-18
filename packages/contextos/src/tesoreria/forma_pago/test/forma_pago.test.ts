import { describe, expect, test } from "vitest";
import { cambiosFormaPago } from "../detalle/detalle.ts";
import { errorPlazos, formaPagoVacia, nuevoPlazo, totalAplazado } from "../dominio.ts";
import { cambiosFormaPagoAApi, formaPagoDesdeApi, nuevaFormaPagoAApi } from "../infraestructura.ts";

describe("formas de pago (formaspago + plazos)", () => {
    test("formaPagoDesdeApi convierte nulos y plazos", () => {
        const formaPago = formaPagoDesdeApi({
            id: "R3060",
            descripcion: null,
            genera_recibos: null,
            cuenta_id: null,
            descripcion_cuenta: null,
            domiciliado: null,
            tipo_pago_facturae: null,
            plazos: [{ dias: 30, aplazado: 50 }, { dias: 60, aplazado: 50 }],
        });
        expect(formaPago.descripcion).toBe("");
        expect(formaPago.generaRecibos).toBe("Emitidos");
        expect(formaPago.domiciliado).toBe(false);
        expect(formaPago.plazos).toHaveLength(2);
    });

    test("cambiosFormaPagoAApi manda vacío como null y los plazos", () => {
        expect(cambiosFormaPagoAApi({ cuentaId: " ", plazos: [{ dias: 0, aplazado: 100 }] })).toEqual({
            cuenta_id: null,
            plazos: [{ dias: 0, aplazado: 100 }],
        });
    });

    test("nuevaFormaPagoAApi recorta el código", () => {
        const api = nuevaFormaPagoAApi({
            id: " CONT ", descripcion: "Contado", generaRecibos: "Pagados",
            cuentaId: "", domiciliado: false, tipoPagoFacturae: "01 Al contado",
        });
        expect(api).toMatchObject({ id: "CONT", genera_recibos: "Pagados", tipo_pago_facturae: "01 Al contado" });
    });

    test("nuevoPlazo propone lo que falta hasta el 100 %", () => {
        expect(nuevoPlazo([])).toEqual({ dias: 0, aplazado: 100 });
        expect(nuevoPlazo([{ dias: 30, aplazado: 33.33 }])).toEqual({ dias: 0, aplazado: 66.67 });
    });

    test("errorPlazos replica las validaciones de plazos.qs y formaspago.qs", () => {
        expect(errorPlazos([{ dias: 30, aplazado: 50 }, { dias: 60, aplazado: 50 }])).toBeNull();
        expect(errorPlazos([])).toMatch(/100%/);
        expect(errorPlazos([{ dias: 30, aplazado: 60 }])).toMatch(/100%/);
        expect(errorPlazos([{ dias: 0, aplazado: 100 }, { dias: 30, aplazado: 0 }])).toMatch(/mayor que cero/);
        expect(errorPlazos([{ dias: -1, aplazado: 100 }])).toMatch(/días/);
        expect(totalAplazado([{ dias: 0, aplazado: 33.33 }, { dias: 0, aplazado: 33.33 }, { dias: 0, aplazado: 33.34 }])).toBe(100);
    });

    test("cambiosFormaPago detecta solo los campos editados", () => {
        const previa = { ...formaPagoVacia(), id: "CONT" };
        expect(cambiosFormaPago(previa, { ...previa, domiciliado: true })).toEqual({ domiciliado: true });
    });
});
