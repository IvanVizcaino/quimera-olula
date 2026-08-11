import { describe, expect, test } from "vitest";
import { validacionCampoModelo } from "@olula/lib/dominio.js";
import { metaRegistroJornada, registroJornadaVacio, ERR_HORA_SALIDA_JORNADA, minutosAHorasMinutos } from "../dominio.ts";
import { metaNuevaJornada, nuevaJornadaFormInicial, ERR_HORA_SALIDA_NUEVA_JORNADA } from "../crear/diseño.ts";
import { puedeAprobarse } from "../dominio.ts";
import { todasPuedenAprobarse } from "../maestro/dominio.ts";

const validarJornada = validacionCampoModelo(metaRegistroJornada);
const validarNuevaJornada = validacionCampoModelo(metaNuevaJornada);

// Spec [crear]
describe("[jornada-crear-01] La hora fin de la jornada no puede ser anterior a la hora de inicio", () => {
    test("es válida si horaSalida está vacía", () => {
        const j = { ...nuevaJornadaFormInicial, horaEntrada: "09:00", horaSalida: "" };
        expect(validarNuevaJornada(j, "horaSalida")).toBe(true);
    });

    test("es válida si horaEntrada está vacía", () => {
        const j = { ...nuevaJornadaFormInicial, horaEntrada: "", horaSalida: "18:00" };
        expect(validarNuevaJornada(j, "horaSalida")).toBe(true);
    });

    test("es válida si horaSalida > horaEntrada", () => {
        const j = { ...nuevaJornadaFormInicial, horaEntrada: "09:00", horaSalida: "18:00" };
        expect(validarNuevaJornada(j, "horaSalida")).toBe(true);
    });

    test("es válida si horaSalida === horaEntrada", () => {
        const j = { ...nuevaJornadaFormInicial, horaEntrada: "09:00", horaSalida: "09:00" };
        expect(validarNuevaJornada(j, "horaSalida")).toBe(true);
    });

    test("es inválida si horaSalida < horaEntrada", () => {
        const j = { ...nuevaJornadaFormInicial, horaEntrada: "18:00", horaSalida: "09:00" };
        expect(validarNuevaJornada(j, "horaSalida")).toBe(ERR_HORA_SALIDA_NUEVA_JORNADA);
    });
});

// Spec [cambiar]
describe("[jornada-cambiar-01] La hora fin de la jornada no puede ser anterior al mayor valor de hora entre la hora de inicio de la jornada y las horas de inicio y/o fin de las pausas", () => {
    test("es válida si no hay hora de salida", () => {
        const j = { ...registroJornadaVacio, horaEntrada: "09:00", horaSalida: null };
        expect(validarJornada(j, "horaSalida")).toBe(true);
    });

    test("es válida si no hay ninguna hora de referencia", () => {
        const j = { ...registroJornadaVacio, horaEntrada: null, horaSalida: "18:00", pausas: [] };
        expect(validarJornada(j, "horaSalida")).toBe(true);
    });

    test("es válida si horaSalida > horaEntrada sin pausas", () => {
        const j = { ...registroJornadaVacio, horaEntrada: "09:00", horaSalida: "18:00", pausas: [] };
        expect(validarJornada(j, "horaSalida")).toBe(true);
    });

    test("es válida si horaSalida === horaEntrada sin pausas", () => {
        const j = { ...registroJornadaVacio, horaEntrada: "09:00", horaSalida: "09:00", pausas: [] };
        expect(validarJornada(j, "horaSalida")).toBe(true);
    });

    test("es inválida si horaSalida < horaEntrada sin pausas", () => {
        const j = { ...registroJornadaVacio, horaEntrada: "18:00", horaSalida: "09:00", pausas: [] };
        expect(validarJornada(j, "horaSalida")).toBe(ERR_HORA_SALIDA_JORNADA);
    });

    test("es válida si horaSalida > horaInicio de pausa (sin horaFin)", () => {
        const j = {
            ...registroJornadaVacio,
            horaEntrada: "09:00",
            horaSalida: "18:00",
            pausas: [{ id: "1", horaInicio: "12:00", horaFin: null, causa: "Almuerzo" }],
        };
        expect(validarJornada(j, "horaSalida")).toBe(true);
    });

    test("es inválida si horaSalida < horaInicio de una pausa", () => {
        const j = {
            ...registroJornadaVacio,
            horaEntrada: "09:00",
            horaSalida: "11:00",
            pausas: [{ id: "1", horaInicio: "12:00", horaFin: null, causa: "Almuerzo" }],
        };
        expect(validarJornada(j, "horaSalida")).toBe(ERR_HORA_SALIDA_JORNADA);
    });

    test("es inválida si horaSalida < horaFin de una pausa", () => {
        const j = {
            ...registroJornadaVacio,
            horaEntrada: "09:00",
            horaSalida: "12:30",
            pausas: [{ id: "1", horaInicio: "12:00", horaFin: "13:00", causa: "Almuerzo" }],
        };
        expect(validarJornada(j, "horaSalida")).toBe(ERR_HORA_SALIDA_JORNADA);
    });

    test("es válida si horaSalida > horaFin de la última pausa", () => {
        const j = {
            ...registroJornadaVacio,
            horaEntrada: "09:00",
            horaSalida: "18:00",
            pausas: [{ id: "1", horaInicio: "12:00", horaFin: "13:00", causa: "Almuerzo" }],
        };
        expect(validarJornada(j, "horaSalida")).toBe(true);
    });

    test("es inválida si horaSalida < la hora más tardía de varias pausas", () => {
        const j = {
            ...registroJornadaVacio,
            horaEntrada: "09:00",
            horaSalida: "15:00",
            pausas: [
                { id: "1", horaInicio: "12:00", horaFin: "13:00", causa: "Almuerzo" },
                { id: "2", horaInicio: "16:00", horaFin: null, causa: "Descanso" },
            ],
        };
        expect(validarJornada(j, "horaSalida")).toBe(ERR_HORA_SALIDA_JORNADA);
    });
});

// Spec [maestro]
describe("[maestro-01] El listado incluye el dato de minutos_jornada de la API en formato hh:mm", () => {
    test("formatea 0 minutos como 00:00", () => {
        expect(minutosAHorasMinutos(0)).toBe("00:00");
    });

    test("formatea 60 minutos como 01:00", () => {
        expect(minutosAHorasMinutos(60)).toBe("01:00");
    });

    test("formatea 90 minutos como 01:30", () => {
        expect(minutosAHorasMinutos(90)).toBe("01:30");
    });

    test("formatea 65 minutos como 01:05 (minutos con cero a la izquierda)", () => {
        expect(minutosAHorasMinutos(65)).toBe("01:05");
    });

    test("formatea 480 minutos como 08:00 (jornada de 8 horas)", () => {
        expect(minutosAHorasMinutos(480)).toBe("08:00");
    });
});

// Spec [aprobar]
describe("[jornada-aprobar-01] Una jornada puede aprobarse si está en Borrador y Cerrada (con hora de fin)", () => {
    test("es true si estado BORRADOR, estadoBorrador CERRADA y con horaSalida", () => {
        const j = { ...registroJornadaVacio, estado: "BORRADOR" as const, estadoBorrador: "CERRADA" as const, horaSalida: "18:00" };
        expect(puedeAprobarse(j)).toBe(true);
    });

    test("es false si estado BORRADOR, estadoBorrador CERRADA pero sin horaSalida (null)", () => {
        const j = { ...registroJornadaVacio, estado: "BORRADOR" as const, estadoBorrador: "CERRADA" as const, horaSalida: null };
        expect(puedeAprobarse(j)).toBe(false);
    });

    test("es false si estado BORRADOR y estadoBorrador ACTIVA", () => {
        const j = { ...registroJornadaVacio, estado: "BORRADOR" as const, estadoBorrador: "ACTIVA" as const, horaSalida: "18:00" };
        expect(puedeAprobarse(j)).toBe(false);
    });

    test("es false si estado BORRADOR y estadoBorrador PAUSADA", () => {
        const j = { ...registroJornadaVacio, estado: "BORRADOR" as const, estadoBorrador: "PAUSADA" as const, horaSalida: "18:00" };
        expect(puedeAprobarse(j)).toBe(false);
    });

    test("es false si estado BORRADOR y estadoBorrador null", () => {
        const j = { ...registroJornadaVacio, estado: "BORRADOR" as const, estadoBorrador: null, horaSalida: "18:00" };
        expect(puedeAprobarse(j)).toBe(false);
    });

    test("es false si estado APROBADA", () => {
        const j = { ...registroJornadaVacio, estado: "APROBADA" as const, estadoBorrador: "CERRADA" as const, horaSalida: "18:00" };
        expect(puedeAprobarse(j)).toBe(false);
    });

    test("es false si estado ANULADA", () => {
        const j = { ...registroJornadaVacio, estado: "ANULADA" as const, estadoBorrador: "CERRADA" as const, horaSalida: "18:00" };
        expect(puedeAprobarse(j)).toBe(false);
    });
});

// Spec [maestro-02]
describe("[maestro-02] El listado permite aprobar varias jornadas si todas pueden ser aprobadas (estado Borrador y Cerrada (con hora fin))", () => {
    const jornadaAprobable = {
        ...registroJornadaVacio,
        estado: "BORRADOR" as const,
        estadoBorrador: "CERRADA" as const,
        horaSalida: "18:00",
    };
    const jornadaNoAprobable = {
        ...registroJornadaVacio,
        estado: "BORRADOR" as const,
        estadoBorrador: "ACTIVA" as const,
        horaSalida: null,
    };

    test("es false si la lista de ids está vacía", () => {
        const jornadas = [{ ...jornadaAprobable, id: "j1" }];
        expect(todasPuedenAprobarse([], jornadas)).toBe(false);
    });

    test("es true si hay un id que apunta a una jornada aprobable", () => {
        const jornadas = [{ ...jornadaAprobable, id: "j1" }];
        expect(todasPuedenAprobarse(["j1"], jornadas)).toBe(true);
    });

    test("es true si hay dos ids y ambas jornadas son aprobables", () => {
        const jornadas = [
            { ...jornadaAprobable, id: "j1" },
            { ...jornadaAprobable, id: "j2" },
        ];
        expect(todasPuedenAprobarse(["j1", "j2"], jornadas)).toBe(true);
    });

    test("es false si hay un id aprobable y otro no aprobable", () => {
        const jornadas = [
            { ...jornadaAprobable, id: "j1" },
            { ...jornadaNoAprobable, id: "j2" },
        ];
        expect(todasPuedenAprobarse(["j1", "j2"], jornadas)).toBe(false);
    });

    test("es false si hay un único id que apunta a una jornada no aprobable", () => {
        const jornadas = [{ ...jornadaNoAprobable, id: "j1" }];
        expect(todasPuedenAprobarse(["j1"], jornadas)).toBe(false);
    });
});
