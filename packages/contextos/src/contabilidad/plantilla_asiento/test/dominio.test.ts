import { describe, expect, test } from "vitest";
import {
    camposPedidos,
    metaPartidaPlantilla,
    nuevaPartidaPlantillaVacia,
    pideAlgo,
    resumenImporte,
    resumenSubcuenta,
    totalesCalculo,
} from "../dominio.ts";

describe("plantilla de asiento dominio (co_planpartidas)", () => {
    test("la partida nueva lleva los valores por defecto de Eneboo", () => {
        expect(nuevaPartidaPlantillaVacia()).toMatchObject({
            tipoSubcuenta: "Pedir",
            debeHaber: "Debe",
            tipoImporte: "Pedir",
            tipoConcepto: "Establecer",
            tipoDocumento: "Establecer",
            tipoDocumentoOrigen: "Recibo",
            tipoFactura: "No pedir",
            tipoBaseImponible: "Calcular",
            tipoContrapartida: "Establecer",
            saltarSiCero: false,
        });
    });

    test("camposPedidos solo marca lo que la plantilla pide", () => {
        const partida = {
            ...nuevaPartidaPlantillaVacia(),
            tipoSubcuenta: "Establecer" as const,
            tipoImporte: "Pedir" as const,
            tipoConcepto: "Pedir" as const,
        };
        expect(camposPedidos(partida)).toEqual({
            subcuenta: false,
            importe: true,
            concepto: true,
            documento: false,
            contrapartida: false,
            baseImponible: false,
            numeroFactura: false,
        });
        expect(pideAlgo(partida)).toBe(true);
        expect(
            pideAlgo({ ...partida, tipoImporte: "Cuadrar", tipoConcepto: "Último" })
        ).toBe(false);
    });

    test("resúmenes para el listado de partidas", () => {
        const base = nuevaPartidaPlantillaVacia();
        expect(resumenSubcuenta({ ...base, tipoSubcuenta: "Definida", variableSubcuenta: "PROV" })).toBe("= PROV");
        expect(resumenSubcuenta({ ...base, codigoSubcuenta: "400" })).toBe("400 (pedir)");
        expect(resumenImporte({ ...base, tipoImporte: "Calcular", importe: "BASE*0.21" })).toBe("= BASE*0.21");
        expect(resumenImporte({ ...base, tipoImporte: "Cuadrar" })).toBe("Cuadrar");
    });

    test("valida variables de hasta 6 caracteres y paréntesis de la fórmula", () => {
        const campos = metaPartidaPlantilla.campos!;
        const base = nuevaPartidaPlantillaVacia();
        expect(campos.variableImporte.validacion!({ ...base, variableImporte: "SIETE77" })).not.toBe(true);
        expect(campos.variableImporte.validacion!({ ...base, variableImporte: "BASE" })).toBe(true);
        expect(campos.importe.validacion!({ ...base, importe: "(BASE*2" })).not.toBe(true);
        expect(campos.importe.validacion!({ ...base, importe: "(BASE*2)/3" })).toBe(true);
    });

    test("totalesCalculo no cuenta las partidas omitidas", () => {
        expect(
            totalesCalculo([
                { debe: 100, haber: 0, omitida: false },
                { debe: 0, haber: 0, omitida: true },
                { debe: 0, haber: 100, omitida: false },
            ])
        ).toEqual({ debe: 100, haber: 100 });
    });
});
