import { describe, expect, test } from "vitest";
import { NuevaRegularizacionIva } from "../diseño.ts";
import {
    cambiarNuevaRegularizacion,
    fechasTrimestre,
    periodoNuevaRegularizacion,
    trimestreDeFechas,
    trimestreSiguiente,
} from "../dominio.ts";
import { fechaAApi } from "../infraestructura.ts";

const nueva = (cambios: Partial<NuevaRegularizacionIva> = {}): NuevaRegularizacionIva => ({
    ejercicioId: "2026",
    trimestre: "T2",
    fechaInicio: new Date(2026, 0, 1, 12),
    fechaFin: new Date(2026, 0, 31, 12),
    fechaAsiento: null,
    codigoSubcuentaDeudora: "",
    codigoSubcuentaAcreedora: "",
    ...cambios,
});

describe("regularización de IVA dominio", () => {
    test("las fechas de cada trimestre van del día 1 al último del tercer mes", () => {
        const t1 = fechasTrimestre(2026, "T1");
        expect(fechaAApi(t1.fechaInicio)).toBe("2026-01-01");
        expect(fechaAApi(t1.fechaFin)).toBe("2026-03-31");
        const t2 = fechasTrimestre(2026, "T2");
        expect(fechaAApi(t2.fechaFin)).toBe("2026-06-30");
        const t4 = fechasTrimestre(2026, "T4");
        expect(fechaAApi(t4.fechaInicio)).toBe("2026-10-01");
        expect(fechaAApi(t4.fechaFin)).toBe("2026-12-31");
    });

    test("se envían las fechas del formulario aunque no coincidan con el trimestre", () => {
        const periodo = periodoNuevaRegularizacion(nueva());
        expect(fechaAApi(periodo.fechaInicio)).toBe("2026-01-01");
        expect(fechaAApi(periodo.fechaFin)).toBe("2026-01-31");
        expect(fechaAApi(periodo.fechaAsiento)).toBe("2026-01-31");
    });

    test("la fecha de asiento indicada se respeta", () => {
        const periodo = periodoNuevaRegularizacion(nueva({
            trimestre: "OTRO",
            fechaAsiento: new Date(2026, 1, 5, 12),
        }));
        expect(fechaAApi(periodo.fechaAsiento)).toBe("2026-02-05");
    });

    test("al cambiar el periodo se cargan sus fechas", () => {
        const cambiada = cambiarNuevaRegularizacion(nueva({ trimestre: "T3" }), "trimestre");
        expect(fechaAApi(cambiada.fechaInicio)).toBe("2026-07-01");
        expect(fechaAApi(cambiada.fechaFin)).toBe("2026-09-30");
    });

    test("al cambiar el ejercicio se cargan las fechas del periodo en ese año", () => {
        const cambiada = cambiarNuevaRegularizacion(
            nueva({ ejercicioId: "2025", trimestre: "T4" }),
            "ejercicioId",
        );
        expect(fechaAApi(cambiada.fechaInicio)).toBe("2025-10-01");
        expect(fechaAApi(cambiada.fechaFin)).toBe("2025-12-31");
    });

    test("con otro periodo no se tocan las fechas", () => {
        const original = nueva({ trimestre: "OTRO" });
        expect(cambiarNuevaRegularizacion(original, "trimestre")).toEqual(original);
    });

    test("al cambiar las fechas a mano se recalcula el periodo", () => {
        const aMano = cambiarNuevaRegularizacion(nueva(), "fechaFin");
        expect(aMano.trimestre).toBe("OTRO");
        expect(fechaAApi(aMano.fechaFin)).toBe("2026-01-31");

        const trimestral = cambiarNuevaRegularizacion(
            nueva({ fechaInicio: new Date(2026, 3, 1), fechaFin: new Date(2026, 5, 30) }),
            "fechaInicio",
        );
        expect(trimestral.trimestre).toBe("T2");
    });

    test("periodo de unas fechas", () => {
        expect(trimestreDeFechas(new Date(2026, 9, 1), new Date(2026, 11, 31))).toBe("T4");
        expect(trimestreDeFechas(new Date(2026, 0, 1), new Date(2026, 2, 30))).toBe("OTRO");
        expect(trimestreDeFechas(null, new Date(2026, 2, 31))).toBe("OTRO");
    });

    test("se propone el primer trimestre sin regularizar del ejercicio", () => {
        const hechas = [
            { ejercicioId: "2026", periodo: "T1" },
            { ejercicioId: "2025", periodo: "T2" },
        ];
        expect(trimestreSiguiente(hechas, "2026")).toBe("T2");
        expect(trimestreSiguiente([], "2026")).toBe("T1");
        expect(trimestreSiguiente(
            ["T1", "T2", "T3", "T4"].map((periodo) => ({ ejercicioId: "2026", periodo })),
            "2026",
        )).toBe("OTRO");
    });
});
