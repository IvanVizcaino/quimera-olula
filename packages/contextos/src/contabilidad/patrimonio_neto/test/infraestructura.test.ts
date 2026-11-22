import { describe, expect, test } from "vitest";
import {
    cambiosPatrimonioNetoAApi,
    estadoDesdeApi,
    EstadoPatrimonioNetoApi,
    nuevoPatrimonioNetoAApi,
    patrimonioNetoDesdeApi,
} from "../infraestructura.ts";

describe("API del estado de cambios en el patrimonio neto", () => {
    test("la ficha pasa los ejercicios nulos a vacío", () => {
        const ficha = patrimonioNetoDesdeApi({
            id: 4,
            descripcion: "ECPN",
            ejercicio_id: "2026",
            ejercicio_anterior_id: null,
            ejercicio_anterior_anterior_id: null,
        });
        expect(ficha.id).toBe("4");
        expect(ficha.ejercicioAnteriorId).toBe("");
    });

    test("el alta manda los ejercicios vacíos como null", () => {
        expect(
            nuevoPatrimonioNetoAApi({
                descripcion: "ECPN",
                ejercicioId: "2026",
                ejercicioAnteriorId: "2025",
                ejercicioAnteriorAnteriorId: "",
            })
        ).toEqual({
            descripcion: "ECPN",
            ejercicio_id: "2026",
            ejercicio_anterior_id: "2025",
            ejercicio_anterior_anterior_id: null,
        });
    });

    test("los cambios solo llevan lo que cambia", () => {
        expect(cambiosPatrimonioNetoAApi({ ejercicioAnteriorId: "" })).toEqual({
            ejercicio_anterior_id: null,
        });
    });

    test("la tabla se traduce con sus filas y columnas", () => {
        const api: EstadoPatrimonioNetoApi = {
            ejercicio_id: "2026",
            ejercicio_anterior_id: null,
            anyo: "2026",
            anyo_anterior: "2025",
            titulo: "Estado de cambios",
            columnas: [{ clave: "total", descripcion: "TOTAL" }],
            filas: [
                {
                    clave: "saldo_final",
                    descripcion: "E. SALDO FINAL DEL AÑO 2026",
                    nivel: 0,
                    importes: [100],
                },
            ],
        };
        const estado = estadoDesdeApi(api);
        expect(estado.anyoAnterior).toBe("2025");
        expect(estado.ejercicioAnteriorId).toBe("");
        expect(estado.filas[0]?.importes).toEqual([100]);
    });
});
