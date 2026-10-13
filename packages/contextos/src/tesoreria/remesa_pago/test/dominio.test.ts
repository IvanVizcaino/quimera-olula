import { describe, expect, test } from "vitest";
import {
    nombreFicheroExportFicheroRemesaPago,
    puedeExcluirReciboDeRemesaPago,
    remesaPagoPuedeExportFicheroBanco,
    remesaPagoRecibosEditable,
} from "../dominio.js";
import { RemesaPago } from "../diseño.js";

const remesaBase = (): RemesaPago => ({
    id: "1",
    fecha: null,
    fechaCargo: null,
    total: 200,
    divisaId: "EUR",
    cuentaId: "CB1",
    estado: "Emitida",
    empresaId: "E1",
    recibos: [
        {
            id: "R1",
            codigo: "RP-1",
            fechaVencimiento: null,
            estado: "Remesado",
            importe: 100,
            proveedorId: "P1",
            nombreProveedor: "A",
            pagos: [],
        },
        {
            id: "R2",
            codigo: "RP-2",
            fechaVencimiento: null,
            estado: "Remesado",
            importe: 100,
            proveedorId: "P2",
            nombreProveedor: "B",
            pagos: [],
        },
    ],
    pagos: [],
});

describe("remesa_pago dominio export fichero banco", () => {
    test("remesaPagoPuedeExportFicheroBanco en Emitida o Pagada", () => {
        expect(remesaPagoPuedeExportFicheroBanco(remesaBase())).toBe(true);
        expect(
            remesaPagoPuedeExportFicheroBanco({ ...remesaBase(), estado: "Pagada" })
        ).toBe(true);
        expect(
            remesaPagoPuedeExportFicheroBanco({ ...remesaBase(), estado: "  emitida " })
        ).toBe(true);
        expect(
            remesaPagoPuedeExportFicheroBanco({ ...remesaBase(), estado: "Anulada" })
        ).toBe(false);
    });

    test("nombreFicheroExportFicheroRemesaPago alinea backend YYYYMMDD_id.ext", () => {
        expect(
            nombreFicheroExportFicheroRemesaPago(
                { id: "42" },
                new Date(2026, 9, 7)
            )
        ).toBe("20261007_42.txt");
        expect(
            nombreFicheroExportFicheroRemesaPago(
                { id: "42" },
                new Date(2026, 9, 7),
                "xml",
            )
        ).toBe("20261007_42.xml");
    });
});

describe("remesa_pago dominio recibos", () => {
    test("remesaPagoRecibosEditable solo en emitida sin pago", () => {
        expect(remesaPagoRecibosEditable(remesaBase())).toBe(true);

        const pagada = { ...remesaBase(), pagos: [{ id: "M1", fecha: null, tipo: "Pago" }] };
        expect(remesaPagoRecibosEditable(pagada)).toBe(false);

        const otroEstado = { ...remesaBase(), estado: "Pagada" };
        expect(remesaPagoRecibosEditable(otroEstado)).toBe(false);
    });

    test("puedeExcluirReciboDeRemesaPago exige más de un recibo", () => {
        const remesa = remesaBase();
        expect(puedeExcluirReciboDeRemesaPago(remesa, "R1")).toBe(true);

        const unSolo = {
            ...remesa,
            recibos: [remesa.recibos[0]],
        };
        expect(puedeExcluirReciboDeRemesaPago(unSolo, "R1")).toBe(false);
        expect(puedeExcluirReciboDeRemesaPago(remesa, "R9")).toBe(false);
    });
});
