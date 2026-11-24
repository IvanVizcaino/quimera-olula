import { describe, expect, it } from "vitest";
import {
    comoBooleano,
    fechaDdMmAaaa,
    horaAApi,
    horaCorta,
    motivoTextoNoValido,
    primerError,
    sumarDias,
    tiempoEnHorasMinutos,
} from "../dominio.ts";

describe("tiempoEnHorasMinutos", () => {
    it("da horas y minutos con dos cifras de minutos", () => {
        expect(tiempoEnHorasMinutos(30600000)).toBe("8:30");
        expect(tiempoEnHorasMinutos(3600000 * 40 + 5 * 60000)).toBe("40:05");
        expect(tiempoEnHorasMinutos(0)).toBe("0:00");
        expect(tiempoEnHorasMinutos(null)).toBe("0:00");
    });

    it("redondea al minuto", () => {
        expect(tiempoEnHorasMinutos(59 * 60000 + 31000)).toBe("1:00");
    });
});

describe("horas", () => {
    it("acorta las de la API y trata vacías y las 00:00 como nulas", () => {
        expect(horaCorta("08:00:00")).toBe("08:00");
        expect(horaCorta(null)).toBe("");
        expect(horaAApi("08:30")).toBe("08:30");
        expect(horaAApi("")).toBeNull();
        expect(horaAApi(null)).toBeNull();
        expect(horaAApi("00:00")).toBeNull();
    });
});

describe("fechas", () => {
    it("formatea la fecha de la API en dd/mm/aaaa", () => {
        expect(fechaDdMmAaaa("2026-03-01")).toBe("01/03/2026");
        expect(fechaDdMmAaaa("")).toBe("");
    });

    it("suma días cruzando meses y años", () => {
        expect(sumarDias("2026-12-31", 1)).toBe("2027-01-01");
        expect(sumarDias("2026-03-01", -1)).toBe("2026-02-28");
    });
});

describe("validaciones de texto", () => {
    it("obligatorio y longitud máxima", () => {
        expect(motivoTextoNoValido(" ", "El código", 10)).toBe("El código es obligatorio");
        expect(motivoTextoNoValido("12345678901", "El código", 10)).not.toBeNull();
        expect(motivoTextoNoValido("", "La nota", 10, false)).toBeNull();
        expect(primerError(null, "uno", "dos")).toBe("uno");
        expect(primerError(null)).toBe(true);
    });

    it("checkbox como booleano", () => {
        expect(comoBooleano("true")).toBe(true);
        expect(comoBooleano("false")).toBe(false);
        expect(comoBooleano(true)).toBe(true);
    });
});
