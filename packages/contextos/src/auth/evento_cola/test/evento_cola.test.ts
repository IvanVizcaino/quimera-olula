import { describe, expect, it } from "vitest";
import { formatearMarcaTiempo, puedeReiniciarse } from "../dominio.ts";
import { eventoColaDetalleDesdeApi } from "../infraestructura.ts";

describe("Cola de eventos", () => {
    it("formatea las fechas como el escritorio", () => {
        expect(formatearMarcaTiempo("2027-01-10T10:00:12.123456")).toBe("10/01/2027 - 10:00:12");
        expect(formatearMarcaTiempo(null)).toBe("");
        // Con zona horaria se pasa a la hora local: el mismo instante se ve igual.
        expect(formatearMarcaTiempo("2026-11-11T17:44:52.5+00:00"))
            .toBe(formatearMarcaTiempo("2026-11-11T18:44:52.5+01:00"));
        expect(formatearMarcaTiempo("2026-11-11T17:44:52.5+00:00")).toMatch(/^11\/11\/2026 - \d{2}:44:52$/);
    });

    it("sólo se reinicia lo que ha fallado", () => {
        expect(puedeReiniciarse({ estado: "Dead" })).toBe(true);
        expect(puedeReiniciarse({ estado: "Error" })).toBe(true);
        expect(puedeReiniciarse({ estado: "Ok" })).toBe(false);
        expect(puedeReiniciarse({ estado: "Pendiente" })).toBe(false);
    });

    it("convierte la ficha de la API", () => {
        const e = eventoColaDetalleDesdeApi({
            id: "39", padre_id: "32", cola_id: "c", tipo: "t", estado: "Dead", num_intento: 2,
            usuario_id: "u", clave: null, timestamp_creacion: "2027-01-10T10:00:00",
            timestamp_ejecucion_programada: null, timestamp_inicio: null, timestamp_fin: null,
            error: "Sin subcuenta", error_detalle: "Traceback", payload: "{}", datos_error: "Sin subcuenta\nTraceback",
        });
        expect(e).toMatchObject({ id: "39", padreId: "32", numIntento: 2, creacion: "2027-01-10T10:00:00", datosError: "Sin subcuenta\nTraceback" });
    });
});
