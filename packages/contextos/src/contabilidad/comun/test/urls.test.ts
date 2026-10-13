import { describe, expect, test } from "vitest";
import CONTABILIDAD_Urls from "../urls.ts";

describe("CONTABILIDAD_Urls", () => {
    test("ASIENTO_RENUMERAR apunta al PATCH de renumeración (CF-01)", () => {
        expect(new CONTABILIDAD_Urls().ASIENTO_RENUMERAR).toBe("/contabilidad/asiento/renumerar");
    });

    test("MODELO_347_EXPORT_AEAT apunta al GET de export AEAT (T6.2)", () => {
        expect(new CONTABILIDAD_Urls().MODELO_347_EXPORT_AEAT(16)).toBe(
            "/contabilidad/modelo_347/16/export_aeat"
        );
    });

    test("MODELO_349_EXPORT_AEAT apunta al GET de export AEAT (CF-09)", () => {
        expect(new CONTABILIDAD_Urls().MODELO_349_EXPORT_AEAT(3)).toBe(
            "/contabilidad/modelo_349/3/export_aeat"
        );
    });

    test("MODELO_340_EXPORT_AEAT apunta al GET de export AEAT (CF-09)", () => {
        expect(new CONTABILIDAD_Urls().MODELO_340_EXPORT_AEAT(7)).toBe(
            "/contabilidad/modelo_340/7/export_aeat"
        );
    });

    test("informes contables pyg/diario y report (T6.1 D2)", () => {
        const u = new CONTABILIDAD_Urls();
        expect(u.INFORME_PYG).toBe("/contabilidad/informe/pyg");
        expect(u.INFORME_DIARIO).toBe("/contabilidad/informe/diario");
        expect(u.INFORME_REPORT("diario")).toBe("/contabilidad/informe/diario/report");
    });
});
