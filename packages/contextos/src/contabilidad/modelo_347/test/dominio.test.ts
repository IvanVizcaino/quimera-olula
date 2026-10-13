import { describe, expect, test } from "vitest";
import {
    camposInmueble347Vacios,
    nombreFicheroExportAeatModelo347,
    nombreFicheroListado347,
    validarCamposInmueble347,
} from "../dominio.ts";

describe("modelo_347 dominio export AEAT", () => {
    test("nombreFicheroExportAeatModelo347 con año", () => {
        expect(nombreFicheroExportAeatModelo347("2025")).toBe("Resumen347_2025.347");
    });

    test("nombreFicheroExportAeatModelo347 fallback id modelo", () => {
        expect(nombreFicheroExportAeatModelo347("", 16)).toBe("Resumen347_16.347");
        expect(nombreFicheroExportAeatModelo347("  ", 16)).toBe("Resumen347_16.347");
    });

    test("nombreFicheroListado347", () => {
        expect(nombreFicheroListado347("clientes", 16)).toBe("modelo-347-clientes-16.pdf");
        expect(nombreFicheroListado347("proveedores", 6)).toBe("modelo-347-proveedores-6.pdf");
    });

    test("validarCamposInmueble347 exige obligatorios e importe numérico", () => {
        expect(validarCamposInmueble347(camposInmueble347Vacios())).toMatch(/obligatorio/);
        const ok = {
            ...camposInmueble347Vacios(),
            nifarrendatario: "B12345678",
            apellidosnombrers: "Arrendatario SL",
            importe: "1200,50",
            situacion: "1",
            refcatastral: "1234567",
            nombrevia: "Mayor",
            localidad: "Valencia",
            municipio: "Valencia",
            codprovincia: "46",
        };
        expect(validarCamposInmueble347(ok)).toBeNull();
    });
});
