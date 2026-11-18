import { describe, expect, test } from "vitest";
import { nuevaPartidaPlantillaVacia } from "../dominio.ts";
import {
    partidaPlantillaAApi,
    partidaPlantillaDesdeApi,
    peticionAsientoDesdePlantillaAApi,
    resultadoCalculoDesdeApi,
} from "../infraestructura.ts";

describe("plantilla de asiento infraestructura", () => {
    test("partidaPlantillaDesdeApi mapea y deja vacíos los nulos", () => {
        const partida = partidaPlantillaDesdeApi({
            id: 7,
            numero_orden: 2,
            tipo_subcuenta: "Establecer",
            codigo_subcuenta: "4720000021",
            variable_subcuenta: null,
            debe_haber: "Haber",
            saltar_si_cero: true,
            tipo_importe: "Calcular",
            importe: "BASE*0.21",
            variable_importe: "IVA",
            tipo_concepto: "Último",
            concepto: null,
            variable_concepto: null,
            tipo_documento: "Establecer",
            documento: null,
            tipo_documento_origen: null,
            tipo_factura: "No pedir",
            serie_id: null,
            tipo_base_imponible: "Calcular",
            base_imponible: "BASE",
            variable_base_imponible: null,
            tipo_contrapartida: "Establecer",
            codigo_contrapartida: null,
            variable_contrapartida: null,
        });
        expect(partida).toMatchObject({
            id: "7",
            numeroOrden: 2,
            debeHaber: "Haber",
            saltarSiCero: true,
            importe: "BASE*0.21",
            concepto: "",
            tipoDocumentoOrigen: "",
        });
    });

    test("partidaPlantillaAApi manda null por los textos vacíos y omite el orden 0", () => {
        const api = partidaPlantillaAApi({ ...nuevaPartidaPlantillaVacia(), concepto: " Pago " });
        expect(api.concepto).toBe("Pago");
        expect(api.codigo_subcuenta).toBeNull();
        expect(api).not.toHaveProperty("numero_orden");
        expect(api.tipo_importe).toBe("Pedir");
    });

    test("partidaPlantillaAApi solo manda los cambios", () => {
        expect(partidaPlantillaAApi({ debeHaber: "Haber" })).toEqual({ debe_haber: "Haber" });
    });

    test("petición de asiento desde plantilla en snake_case", () => {
        expect(
            peticionAsientoDesdePlantillaAApi({
                plantillaId: "NOM",
                ejercicioId: "2026",
                fecha: new Date("2026-03-15T12:00:00"),
                concepto: "",
                valores: { "3": { importe: 100, codigoSubcuenta: "4000000001" } },
                variables: { BASE: "100.00" },
            })
        ).toEqual({
            plantilla_id: "NOM",
            ejercicio_id: "2026",
            fecha: "2026-03-15",
            valores: { "3": { importe: 100, codigo_subcuenta: "4000000001" } },
            variables: { BASE: "100.00" },
        });
    });

    test("resultadoCalculoDesdeApi", () => {
        const r = resultadoCalculoDesdeApi({
            plantilla_id: "NOM",
            partidas: [{
                partida_plantilla_id: "3", numero_orden: 1, codigo_subcuenta: "6280000000",
                debe: 100, haber: 0, concepto: "x", documento: "", tipo_documento: null,
                codigo_contrapartida: null, es_iva: false, base_imponible: null,
                serie_id: null, numero_factura: null, omitida: false,
            }],
            descuadre: 0,
            variables: { BASE: "100.00" },
            siguiente_plantilla_id: null,
            avisos: [],
        });
        expect(r.siguientePlantillaId).toBe("");
        expect(r.partidas[0]).toMatchObject({ codigoSubcuenta: "6280000000", tipoDocumento: "", codigoContrapartida: "" });
    });
});
