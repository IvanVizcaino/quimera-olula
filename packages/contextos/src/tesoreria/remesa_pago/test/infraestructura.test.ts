import { RestAPI } from "@olula/lib/api/rest_api.ts";
import { describe, expect, test, vi } from "vitest";
import {
    deshacerPagoRemesaPago,
    getExportFicheroRemesaPago,
    pagarRemesaPago,
    patchAsociarRecibosRemesaPago,
    patchExcluirReciboRemesaPago,
    remesaPagoDesdeApi,
} from "../infraestructura.js";

describe("remesa_pago infraestructura", () => {
    test("remesaPagoDesdeApi mapea recibos de proveedor", () => {
        const remesa = remesaPagoDesdeApi({
            id: "1",
            fecha: "2026-01-15",
            fecha_cargo: "2026-01-20",
            total: 100,
            divisa_id: "EUR",
            cuenta_id: "CB1",
            estado: "Emitida",
            empresa_id: "E1",
            recibos: [
                {
                    id: "R1",
                    codigo: "RP-1",
                    fecha_vencimiento: "2026-02-01",
                    estado: "Remesado",
                    importe: 100,
                    proveedor_id: "P1",
                    nombre_proveedor: "Proveedor SA",
                    pagos: [],
                },
            ],
            pagos: [],
        });

        expect(remesa.recibos[0].nombreProveedor).toBe("Proveedor SA");
        expect(remesa.recibos[0].proveedorId).toBe("P1");
        expect(remesa.fecha?.toISOString().slice(0, 10)).toBe("2026-01-15");
    });

    test("pagarRemesaPago llama POST …/pagar con fecha", async () => {
        const post = vi.spyOn(RestAPI, "post").mockResolvedValue({ id: "7" });

        await pagarRemesaPago("7", { fecha: "2026-03-01" });

        expect(post).toHaveBeenCalledWith(
            expect.stringMatching(/\/tesoreria\/remesa_pago\/7\/pagar$/),
            { fecha: "2026-03-01", iban: null, numero_cheque: null },
            "Error al pagar la remesa de pago"
        );

        post.mockRestore();
    });

    test("deshacerPagoRemesaPago llama DELETE …/pago", async () => {
        const del = vi.spyOn(RestAPI, "delete").mockResolvedValue(undefined);

        await deshacerPagoRemesaPago("7");

        expect(del).toHaveBeenCalledWith(
            expect.stringMatching(/\/tesoreria\/remesa_pago\/7\/pago$/),
            "Error al deshacer el pago de la remesa de pago"
        );

        del.mockRestore();
    });

    test("patchAsociarRecibosRemesaPago llama PATCH …/asociar_recibos", async () => {
        const patch = vi.spyOn(RestAPI, "patch").mockResolvedValue(undefined);

        await patchAsociarRecibosRemesaPago("7", ["R1", "R2"]);

        expect(patch).toHaveBeenCalledWith(
            expect.stringMatching(/\/tesoreria\/remesa_pago\/7\/asociar_recibos$/),
            { recibo_ids: ["R1", "R2"] },
            "Error al asociar recibos a la remesa de pago"
        );

        patch.mockRestore();
    });

    test("patchExcluirReciboRemesaPago llama PATCH …/excluir_recibo", async () => {
        const patch = vi.spyOn(RestAPI, "patch").mockResolvedValue(undefined);

        await patchExcluirReciboRemesaPago("7", "R1");

        expect(patch).toHaveBeenCalledWith(
            expect.stringMatching(/\/tesoreria\/remesa_pago\/7\/excluir_recibo$/),
            { recibo_id: "R1" },
            "Error al excluir el recibo de la remesa de pago"
        );

        patch.mockRestore();
    });

    test("getExportFicheroRemesaPago llama GET …/export_fichero CSB34 SEPA", async () => {
        const blobFn = vi.spyOn(RestAPI, "blob").mockResolvedValue(new Blob(["x"]));

        const res = await getExportFicheroRemesaPago("7");

        expect(blobFn).toHaveBeenCalledWith(
            expect.stringMatching(
                /\/tesoreria\/remesa_pago\/7\/export_fichero\?formato=csb34_sepa_txt$/
            ),
            "Error al descargar fichero bancario de la remesa de pago"
        );
        expect(res).toBeInstanceOf(Blob);

        blobFn.mockRestore();
    });

    test("getExportFicheroRemesaPago acepta formato XML y clásico", async () => {
        const blobFn = vi.spyOn(RestAPI, "blob").mockResolvedValue(new Blob(["x"]));

        await getExportFicheroRemesaPago("7", "csb34_sepa_xml");
        expect(blobFn).toHaveBeenCalledWith(
            expect.stringMatching(/\?formato=csb34_sepa_xml$/),
            expect.any(String),
        );

        await getExportFicheroRemesaPago("7", "csb34_clasico_txt");
        expect(blobFn).toHaveBeenCalledWith(
            expect.stringMatching(/\?formato=csb34_clasico_txt$/),
            expect.any(String),
        );

        blobFn.mockRestore();
    });
});
