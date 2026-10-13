import { describe, expect, test } from "vitest";
import {
    filtroArqueoAbierto,
    urlDetalleArqueo,
    urlMaestroArqueos,
} from "../dominio_arqueo_caja.ts";

describe("widget arqueo caja", () => {
    test("filtra arqueos abiertos", () => {
        expect(filtroArqueoAbierto()).toEqual([["abierto", "eq", "true"]]);
    });

    test("enlaces al maestro y detalle", () => {
        expect(urlMaestroArqueos()).toContain("/tpv/arqueo?");
        expect(urlMaestroArqueos()).toContain("abierto");
        expect(urlDetalleArqueo("00001234")).toBe("/tpv/arqueo?id=00001234");
    });
});
