import { describe, expect, test } from "vitest";
import { getMaquina } from "../detalle/maquina.js";

describe("remesa_pago detalle maquina", () => {
    const maquina = getMaquina();

    test("ABIERTO transita a ASOCIANDO_RECIBOS y EXCLUYENDO_RECIBO", () => {
        expect(maquina.ABIERTO.asociar_recibos_solicitado).toBe("ASOCIANDO_RECIBOS");
        expect(maquina.ABIERTO.excluir_recibo_solicitado).toEqual(
            expect.arrayContaining([expect.any(Function)])
        );
    });

    test("ASOCIANDO_RECIBOS confirma con proceso y cancela a ABIERTO", () => {
        expect(maquina.ASOCIANDO_RECIBOS.asociar_recibos_confirmado).toEqual(
            expect.arrayContaining([expect.any(Function)])
        );
        expect(maquina.ASOCIANDO_RECIBOS.asociar_recibos_cancelado).toBe("ABIERTO");
    });

    test("EXCLUYENDO_RECIBO confirma con proceso y cancela a ABIERTO", () => {
        expect(maquina.EXCLUYENDO_RECIBO.excluir_recibo_confirmado).toEqual(
            expect.arrayContaining([expect.any(Function)])
        );
        expect(maquina.EXCLUYENDO_RECIBO.excluir_recibo_cancelado).toEqual(
            expect.arrayContaining([expect.any(Function)])
        );
    });
});
