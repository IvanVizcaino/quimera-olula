import { describe, expect, it } from "vitest";
import { diasEntre, generacionVacia, MAXIMO_DIAS_GENERAR, motivoGeneracionNoValida, rangoMes } from "../dominio.ts";
import { diaCalendarioDesdeApi } from "../infraestructura.ts";

const hoy = "2026-11-24";
const valida = { desde: hoy, hasta: "2026-12-31", horarioLaboralId: "N", horarioSabadoId: "", horarioDomingoId: "" };

describe("calendario", () => {
    it("cuenta los días de un rango con los dos extremos", () => {
        expect(diasEntre("2026-11-24", "2026-11-24")).toBe(1);
        expect(diasEntre("2026-02-01", "2026-03-01")).toBe(29);
    });

    it("propone el mes actual y una generación hasta fin de año", () => {
        expect(rangoMes(new Date(2026, 1, 10))).toEqual({ desde: "2026-02-01", hasta: "2026-02-28" });
        expect(generacionVacia(new Date(2026, 10, 24))).toMatchObject({ desde: "2026-11-24", hasta: "2026-12-31" });
    });

    it("valida la generación como el servidor", () => {
        expect(motivoGeneracionNoValida(valida, hoy)).toBeNull();
        expect(motivoGeneracionNoValida({ ...valida, desde: "2026-11-23" }, hoy)).toMatch(/anterior a hoy/);
        expect(motivoGeneracionNoValida({ ...valida, hasta: "2026-11-01" }, hoy)).toMatch(/anterior/);
        expect(motivoGeneracionNoValida({ ...valida, horarioLaboralId: "" }, hoy)).toMatch(/horario/);
        expect(motivoGeneracionNoValida({ ...valida, hasta: "2031-12-31" }, hoy))
            .toBe(`No se pueden generar más de ${MAXIMO_DIAS_GENERAR} días de una vez`);
    });

    it("lee un día de la API", () => {
        expect(diaCalendarioDesdeApi({
            fecha: "2026-11-28", descripcion: "Sábado", horario_id: null, horario: null,
            hora_entrada_manana: null, hora_salida_manana: null, hora_entrada_tarde: null, hora_salida_tarde: null,
            tiempo: 0,
        })).toMatchObject({ id: "2026-11-28", fecha: "2026-11-28", horarioId: "", tiempo: 0, horaEntradaManana: "" });
    });
});
