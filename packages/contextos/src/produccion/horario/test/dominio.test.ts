import { describe, expect, it } from "vitest";
import { motivoHorasNoValidas, nuevoHorarioVacio, tiempoHorario, validarHorario } from "../dominio.ts";
import { cambiosHorarioAApi, horarioDesdeApi, nuevoHorarioAApi } from "../infraestructura.ts";

const partido = {
    ...nuevoHorarioVacio,
    id: "N",
    descripcion: "Normal",
    horaEntradaManana: "08:00",
    horaSalidaManana: "13:00",
    horaEntradaTarde: "15:00",
    horaSalidaTarde: "18:30",
};

describe("horarios", () => {
    it("calcula el tiempo de la mañana más la tarde en ms", () => {
        expect(tiempoHorario(partido)).toBe((5 * 60 + 3 * 60 + 30) * 60000);
        expect(tiempoHorario({ ...partido, horaEntradaTarde: "", horaSalidaTarde: "" })).toBe(5 * 3600000);
        expect(tiempoHorario(nuevoHorarioVacio)).toBe(0);
    });

    it("valida los tramos como pr_horarios.qs", () => {
        expect(validarHorario(partido)).toBe(true);
        expect(motivoHorasNoValidas({ ...partido, horaSalidaManana: "" })).toMatch(/salida por la mañana/);
        expect(motivoHorasNoValidas({ ...partido, horaEntradaManana: "" })).toMatch(/entrada por la mañana/);
        expect(motivoHorasNoValidas({ ...partido, horaSalidaManana: "07:00" })).not.toBeNull();
        expect(motivoHorasNoValidas({ ...partido, horaEntradaTarde: "12:00" })).not.toBeNull();
        expect(motivoHorasNoValidas({ ...partido, horaSalidaTarde: "14:00" })).not.toBeNull();
        expect(validarHorario({ ...partido, id: "123456789" })).not.toBe(true);
    });

    it("convierte desde y hacia la API", () => {
        expect(horarioDesdeApi({
            id: "N", descripcion: "Normal", hora_entrada_manana: "08:00:00", hora_salida_manana: "13:00:00",
            hora_entrada_tarde: null, hora_salida_tarde: null, tiempo: 18000000,
        })).toEqual({
            id: "N", descripcion: "Normal", horaEntradaManana: "08:00", horaSalidaManana: "13:00",
            horaEntradaTarde: "", horaSalidaTarde: "", tiempo: 18000000,
        });
        expect(nuevoHorarioAApi({ ...partido, horaEntradaTarde: "", horaSalidaTarde: "" })).toEqual({
            id: "N", descripcion: "Normal", hora_entrada_manana: "08:00", hora_salida_manana: "13:00",
            hora_entrada_tarde: null, hora_salida_tarde: null,
        });
        expect(cambiosHorarioAApi({ descripcion: "Otra" })).toEqual({ descripcion: "Otra" });
        expect(cambiosHorarioAApi({ horaEntradaManana: "09:00" })).toEqual({
            hora_entrada_manana: "09:00", hora_salida_manana: null, hora_entrada_tarde: null, hora_salida_tarde: null,
        });
    });
});
