import { describe, expect, test } from "vitest";
import { validacionCampoModelo } from "@olula/lib/dominio.js";
import { registroJornadaVacio } from "../dominio.ts";
import {
    metaPausaForm,
    pausaFormInicial,
    ERR_PAUSA_INICIO_ANTERIOR_ENTRADA,
    ERR_PAUSA_INICIO_POSTERIOR_SALIDA,
    ERR_PAUSA_FIN_POSTERIOR_SALIDA,
    ERR_PAUSA_FIN_ANTERIOR_ENTRADA,
    ERR_PAUSA_SOLAPA,
} from "../pausas/diseño.ts";

const jornada09a18 = {
    ...registroJornadaVacio,
    horaEntrada: "09:00",
    horaSalida: "18:00",
    pausas: [],
};

// Spec: Las horas de inicio y fin de las pausas deben estar comprendidas
// en el intervalo hora inicio - hora fin de la jornada

describe("[pausa-01] Las horas de inicio y fin de las pausas deben estar comprendidas en el intervalo hora inicio - hora fin de la jornada", () => {
    describe("horaInicio", () => {
        test("es válida si horaInicio === horaEntrada", () => {
            const validar = validacionCampoModelo(metaPausaForm(jornada09a18));
            expect(validar({ ...pausaFormInicial, horaInicio: "09:00" }, "horaInicio")).toBe(true);
        });

        test("es válida si horaInicio está entre horaEntrada y horaSalida", () => {
            const validar = validacionCampoModelo(metaPausaForm(jornada09a18));
            expect(validar({ ...pausaFormInicial, horaInicio: "12:00" }, "horaInicio")).toBe(true);
        });

        test("es inválida si horaInicio < horaEntrada", () => {
            const validar = validacionCampoModelo(metaPausaForm(jornada09a18));
            expect(validar({ ...pausaFormInicial, horaInicio: "08:00" }, "horaInicio")).toBe(ERR_PAUSA_INICIO_ANTERIOR_ENTRADA);
        });

        test("es inválida si horaInicio > horaSalida", () => {
            const validar = validacionCampoModelo(metaPausaForm(jornada09a18));
            expect(validar({ ...pausaFormInicial, horaInicio: "19:00" }, "horaInicio")).toBe(ERR_PAUSA_INICIO_POSTERIOR_SALIDA);
        });

        test("es válida si la jornada no tiene horaEntrada ni horaSalida", () => {
            const jornadaSinHoras = { ...registroJornadaVacio, horaEntrada: null, horaSalida: null, pausas: [] };
            const validar = validacionCampoModelo(metaPausaForm(jornadaSinHoras));
            expect(validar({ ...pausaFormInicial, horaInicio: "10:00" }, "horaInicio")).toBe(true);
        });
    });

    describe("horaFin", () => {
        test("es válida si horaFin es null", () => {
            const validar = validacionCampoModelo(metaPausaForm(jornada09a18));
            expect(validar({ ...pausaFormInicial, horaInicio: "10:00", horaFin: null }, "horaFin")).toBe(true);
        });

        test("es válida si horaFin === horaSalida", () => {
            const validar = validacionCampoModelo(metaPausaForm(jornada09a18));
            expect(validar({ ...pausaFormInicial, horaInicio: "10:00", horaFin: "18:00" }, "horaFin")).toBe(true);
        });

        test("es válida si horaFin está dentro del intervalo", () => {
            const validar = validacionCampoModelo(metaPausaForm(jornada09a18));
            expect(validar({ ...pausaFormInicial, horaInicio: "10:00", horaFin: "12:00" }, "horaFin")).toBe(true);
        });

        test("es inválida si horaFin > horaSalida", () => {
            const validar = validacionCampoModelo(metaPausaForm(jornada09a18));
            expect(validar({ ...pausaFormInicial, horaInicio: "10:00", horaFin: "19:00" }, "horaFin")).toBe(ERR_PAUSA_FIN_POSTERIOR_SALIDA);
        });

        test("es inválida si horaFin < horaEntrada", () => {
            const validar = validacionCampoModelo(metaPausaForm(jornada09a18));
            expect(validar({ ...pausaFormInicial, horaInicio: "10:00", horaFin: "08:00" }, "horaFin")).toBe(ERR_PAUSA_FIN_ANTERIOR_ENTRADA);
        });
    });
});

// Spec: Las horas de inicio y fin de las pausas no pueden solaparse
// con los intervalos definidos por otras pausas de la misma jornada

const jornadaConPausa = {
    ...registroJornadaVacio,
    horaEntrada: "09:00",
    horaSalida: "18:00",
    pausas: [{ id: "p1", horaInicio: "12:00", horaFin: "13:00", causa: "Almuerzo" }],
};

describe("[pausa-02] Las horas de inicio y fin de las pausas no pueden solaparse con los intervalos definidos por otras pausas de la misma jornada", () => {
    describe("horaInicio", () => {
        test("es válida si la nueva pausa no solapa (antes)", () => {
            const validar = validacionCampoModelo(metaPausaForm(jornadaConPausa));
            expect(validar({ ...pausaFormInicial, horaInicio: "10:00", horaFin: "11:00" }, "horaInicio")).toBe(true);
        });

        test("es válida si la nueva pausa no solapa (después)", () => {
            const validar = validacionCampoModelo(metaPausaForm(jornadaConPausa));
            expect(validar({ ...pausaFormInicial, horaInicio: "14:00", horaFin: "15:00" }, "horaInicio")).toBe(true);
        });

        test("es válida con intervalos exactamente adyacentes (inicio nueva = fin existente)", () => {
            // [12:00,13:00] y [13:00,14:00] comparten el extremo pero no se solapan
            const validar = validacionCampoModelo(metaPausaForm(jornadaConPausa));
            expect(validar({ ...pausaFormInicial, horaInicio: "13:00", horaFin: "14:00" }, "horaInicio")).toBe(true);
        });

        test("es inválida si horaInicio cae dentro del intervalo de otra pausa", () => {
            const validar = validacionCampoModelo(metaPausaForm(jornadaConPausa));
            expect(validar({ ...pausaFormInicial, horaInicio: "12:30", horaFin: "14:00" }, "horaInicio")).toBe(ERR_PAUSA_SOLAPA);
        });

        test("es inválida si la nueva pausa engloba completamente una pausa existente", () => {
            const validar = validacionCampoModelo(metaPausaForm(jornadaConPausa));
            expect(validar({ ...pausaFormInicial, horaInicio: "11:00", horaFin: "14:00" }, "horaInicio")).toBe(ERR_PAUSA_SOLAPA);
        });

        test("al editar, no se solapa consigo misma", () => {
            const validar = validacionCampoModelo(metaPausaForm(jornadaConPausa, "p1"));
            expect(validar({ ...pausaFormInicial, horaInicio: "12:00", horaFin: "13:00" }, "horaInicio")).toBe(true);
        });

        test("al editar, detecta solapamiento con otra pausa distinta", () => {
            const jornadaConDosPausas = {
                ...registroJornadaVacio,
                horaEntrada: "09:00",
                horaSalida: "18:00",
                pausas: [
                    { id: "p1", horaInicio: "12:00", horaFin: "13:00", causa: "Almuerzo" },
                    { id: "p2", horaInicio: "15:00", horaFin: "16:00", causa: "Café" },
                ],
            };
            const validar = validacionCampoModelo(metaPausaForm(jornadaConDosPausas, "p1"));
            // Editar p1 para solapar con p2
            expect(validar({ ...pausaFormInicial, horaInicio: "14:00", horaFin: "15:30" }, "horaInicio")).toBe(ERR_PAUSA_SOLAPA);
        });
    });

    describe("horaFin", () => {
        test("es válida si horaFin es null (no aplica chequeo de solapamiento)", () => {
            const validar = validacionCampoModelo(metaPausaForm(jornadaConPausa));
            expect(validar({ ...pausaFormInicial, horaInicio: "14:00", horaFin: null }, "horaFin")).toBe(true);
        });

        test("es válida si horaFin no genera solapamiento", () => {
            const validar = validacionCampoModelo(metaPausaForm(jornadaConPausa));
            expect(validar({ ...pausaFormInicial, horaInicio: "14:00", horaFin: "15:00" }, "horaFin")).toBe(true);
        });

        test("es válida con intervalos exactamente adyacentes (fin nueva = inicio existente)", () => {
            // [11:00,12:00] y [12:00,13:00] no se solapan
            const validar = validacionCampoModelo(metaPausaForm(jornadaConPausa));
            expect(validar({ ...pausaFormInicial, horaInicio: "11:00", horaFin: "12:00" }, "horaFin")).toBe(true);
        });

        test("es inválida si horaFin cae dentro del intervalo de otra pausa", () => {
            const validar = validacionCampoModelo(metaPausaForm(jornadaConPausa));
            expect(validar({ ...pausaFormInicial, horaInicio: "11:00", horaFin: "12:30" }, "horaFin")).toBe(ERR_PAUSA_SOLAPA);
        });

        test("al editar, horaFin no se solapa consigo misma", () => {
            const validar = validacionCampoModelo(metaPausaForm(jornadaConPausa, "p1"));
            expect(validar({ ...pausaFormInicial, horaInicio: "12:00", horaFin: "13:00" }, "horaFin")).toBe(true);
        });
    });
});
