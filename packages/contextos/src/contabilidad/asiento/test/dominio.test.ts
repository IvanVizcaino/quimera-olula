import { describe, expect, test } from "vitest";
import {
    asientoCuadrado,
    descuadrePartidas,
    ejercicioIdEnCriteria,
    ejercicioIdParaRenumerar,
    metaNuevoAsientoManual,
    totalDebe,
    totalHaber,
} from "../dominio.ts";
import { NuevoAsientoManual, PartidaManualInput } from "../diseño.ts";
import { criteriaDefecto, modeloEsValido } from "@olula/lib/dominio.ts";

describe("dominio asiento manual", () => {
    test("totalDebe y totalHaber suman partidas", () => {
        const partidas = [
            { debe: 100, haber: 0 },
            { debe: 0, haber: 100 },
        ];
        expect(totalDebe(partidas)).toBe(100);
        expect(totalHaber(partidas)).toBe(100);
        expect(descuadrePartidas(partidas)).toBe(0);
        expect(asientoCuadrado(partidas)).toBe(true);
    });

    test("ejercicioIdEnCriteria lee filtro eq del listado", () => {
        expect(
            ejercicioIdEnCriteria({
                ...criteriaDefecto,
                filtro: [["ejercicio_id", "eq", "2025"]],
            })
        ).toBe("2025");
        expect(ejercicioIdParaRenumerar({ ...criteriaDefecto, filtro: [] })).toMatch(/^\d{4}$/);
    });

    test("detecta descuadre", () => {
        const partidas = [
            { debe: 100, haber: 0 },
            { debe: 0, haber: 50 },
        ];
        expect(asientoCuadrado(partidas)).toBe(false);
        expect(descuadrePartidas(partidas)).toBe(50);
    });
});

describe("metaNuevoAsientoManual", () => {
    const partida = (p: Partial<PartidaManualInput> = {}): PartidaManualInput => ({
        subcuentaId: 1,
        debe: 0,
        haber: 0,
        concepto: "",
        ...p,
    });

    const asiento = (cambios: Partial<NuevoAsientoManual> = {}): NuevoAsientoManual => ({
        ejercicioId: "2025",
        fecha: new Date("2025-06-01T12:00:00"),
        concepto: "Asiento de prueba",
        tipoDocumento: "",
        documento: "",
        partidas: [
            partida({ subcuentaId: 1, debe: 100 }),
            partida({ subcuentaId: 2, haber: 100 }),
        ],
        ...cambios,
    });

    const esValido = (modelo: NuevoAsientoManual) => modeloEsValido(metaNuevoAsientoManual)(modelo);

    test("válido cuando cuadra y hay dos partidas con subcuenta", () => {
        expect(esValido(asiento())).toBe(true);
    });

    test("inválido si el debe no suma lo mismo que el haber", () => {
        const descuadrado = asiento({
            partidas: [
                partida({ subcuentaId: 1, debe: 100 }),
                partida({ subcuentaId: 2, haber: 50 }),
            ],
        });
        expect(esValido(descuadrado)).toBe(false);
    });

    test("inválido con menos de dos partidas", () => {
        expect(esValido(asiento({ partidas: [partida({ subcuentaId: 1 })] }))).toBe(false);
    });

    test("inválido si alguna partida se queda sin subcuenta", () => {
        const sinSubcuenta = asiento({
            partidas: [
                partida({ subcuentaId: 0, debe: 100 }),
                partida({ subcuentaId: 2, haber: 100 }),
            ],
        });
        expect(esValido(sinSubcuenta)).toBe(false);
    });

    test("inválido con el concepto en blanco", () => {
        expect(esValido(asiento({ concepto: "   " }))).toBe(false);
    });

    test("tolera el redondeo por debajo de medio céntimo", () => {
        const casiCuadrado = asiento({
            partidas: [
                partida({ subcuentaId: 1, debe: 100 }),
                partida({ subcuentaId: 2, haber: 100.001 }),
            ],
        });
        expect(esValido(casiCuadrado)).toBe(true);
    });
});
