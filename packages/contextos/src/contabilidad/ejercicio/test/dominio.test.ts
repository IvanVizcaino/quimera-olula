import { describe, expect, test } from "vitest";
import { Ejercicio } from "../diseño.ts";
import {
    asientosDelEjercicio,
    ejerciciosApertura,
    mensajeReabrir,
    ejercicioVacio,
    esAvisoCuentasSinCodigoBalance,
    nuevoEjercicioPropuesto,
    opcionesCierreAEnviar,
    opcionesCierreIniciales,
    puedeCerrar,
    puedeReabrir,
    puedeGenerarPgc,
    seriesDesdeTexto,
    textoAviso,
    urlAsiento,
    validarOpcionesCierre,
} from "../dominio.ts";
import { fechaAApi, opcionesCierreAApi } from "../infraestructura.ts";

const ejercicio = (id: string, anyo: number, cambios: Partial<Ejercicio> = {}): Ejercicio => ({
    ...ejercicioVacio(),
    id,
    nombre: `EJERCICIO ${id}`,
    empresaId: 1,
    fechaInicio: new Date(anyo, 0, 1, 12),
    fechaFin: new Date(anyo, 11, 31, 12),
    tienePgc: true,
    ...cambios,
});

describe("ejercicios: alta", () => {
    test("propone el ejercicio siguiente copiando el PGC del último", () => {
        const propuesto = nuevoEjercicioPropuesto([ejercicio("2025", 2025), ejercicio("2026", 2026)]);
        expect(propuesto.id).toBe("2027");
        expect(propuesto.nombre).toBe("EJERCICIO 2027");
        expect(fechaAApi(propuesto.fechaInicio)).toBe("2027-01-01");
        expect(fechaAApi(propuesto.fechaFin)).toBe("2027-12-31");
        expect(propuesto.ejercicioOrigenPgc).toBe("2026");
    });

    test("sin ejercicios propone el año en curso y PGC nuevo", () => {
        const propuesto = nuevoEjercicioPropuesto([]);
        expect(propuesto.id).toBe(String(new Date().getFullYear()));
        expect(propuesto.ejercicioOrigenPgc).toBe("");
        expect(propuesto.digitosSubcuenta).toBe(10);
    });

    test("las series se separan por comas o espacios", () => {
        expect(seriesDesdeTexto("A, B  R")).toEqual(["A", "B", "R"]);
        expect(seriesDesdeTexto("")).toEqual([]);
    });
});

describe("ejercicios: cierre", () => {
    test("acciones según el estado", () => {
        expect(puedeGenerarPgc(ejercicio("2026", 2026))).toBe(false);
        expect(puedeGenerarPgc(ejercicio("2027", 2027, { tienePgc: false }))).toBe(true);
        // A5: Cerrar solo si está abierto y Reabrir solo si está cerrado.
        expect(puedeCerrar(ejercicio("2026", 2026))).toBe(true);
        expect(puedeCerrar(ejercicio("2026", 2026, { estado: "CERRADO" }))).toBe(false);
        expect(puedeReabrir(ejercicio("2026", 2026))).toBe(false);
        expect(puedeReabrir(ejercicio("2026", 2026, { estado: "CERRADO" }))).toBe(true);
        expect(puedeReabrir(ejercicio("2026", 2026, { asientoPygId: 7 }))).toBe(false);
    });

    test("asientos del ejercicio: apertura, regularización y cierre, los que haya (A4)", () => {
        expect(asientosDelEjercicio(ejercicio("2026", 2026))).toEqual([]);

        const cerrado = ejercicio("2026", 2026, {
            estado: "CERRADO", asientoAperturaId: 3, asientoPygId: 7, asientoCierreId: 8,
        });
        expect(asientosDelEjercicio(cerrado)).toEqual([
            { tipo: "APERTURA", titulo: "Asiento de apertura", asientoId: "3" },
            { tipo: "REGULARIZACION", titulo: "Asiento de regularización (pérdidas y ganancias)", asientoId: "7" },
            { tipo: "CIERRE", titulo: "Asiento de cierre", asientoId: "8" },
        ]);

        const regularizado = ejercicio("2026", 2026, { asientoPygId: 7 });
        expect(asientosDelEjercicio(regularizado).map((a) => a.tipo)).toEqual(["REGULARIZACION"]);
    });

    test("«Ir a ver asiento» abre Contabilidad > Asientos filtrado por su ejercicio", () => {
        expect(urlAsiento("42", "2027")).toBe("/contabilidad/asiento?id=42&ejercicio_id=eq__2027");
        expect(urlAsiento("42", "")).toBe("/contabilidad/asiento?id=42");
    });

    test("ejercicios de apertura: abiertos, posteriores y sin apertura, por fecha (A5b)", () => {
        const e26 = ejercicio("2026", 2026);
        const lista = [
            e26, ejercicio("2028", 2028), ejercicio("2027", 2027),
            ejercicio("2029", 2029, { estado: "CERRADO" }),
            ejercicio("2030", 2030, { asientoAperturaId: 4 }),
            ejercicio("2025", 2025),
        ];
        expect(ejerciciosApertura(e26, lista).map((e) => e.id)).toEqual(["2027", "2028"]);
        expect(ejerciciosApertura(e26, [e26])).toEqual([]);
    });

    test("modal de cierre: fin del ejercicio, los tres asientos y el primer ejercicio de apertura (A5b)", () => {
        const e26 = ejercicio("2026", 2026);
        const opciones = opcionesCierreIniciales(e26, [e26, ejercicio("2027", 2027)]);
        expect(fechaAApi(opciones.fecha)).toBe("2026-12-31");
        expect(opciones.regularizar).toBe(true);
        expect(opciones.cerrar).toBe(true);
        expect(opciones.abrir).toBe(true);
        expect(opciones.ejercicioDestinoId).toBe("2027");
        expect(validarOpcionesCierre(e26, opciones)).toBe(true);

        expect(validarOpcionesCierre(e26, { ...opciones, ejercicioDestinoId: "" }))
            .toMatch(/ejercicio sobre el que se creará el asiento de apertura/);
        expect(validarOpcionesCierre(e26, { ...opciones, abrir: false, ejercicioDestinoId: "" })).toBe(true);
        expect(validarOpcionesCierre(e26, { ...opciones, fecha: new Date(2027, 0, 1, 12) }))
            .toMatch(/dentro del ejercicio/);
    });

    test("al enviar: no repite la regularización y sin apertura no manda ejercicio (A5b)", () => {
        const regularizado = ejercicio("2026", 2026, { asientoPygId: 5 });
        const opciones = opcionesCierreIniciales(regularizado, [regularizado, ejercicio("2027", 2027)]);
        expect(opcionesCierreAEnviar(regularizado, opciones).regularizar).toBe(false);
        expect(opcionesCierreAEnviar(regularizado, { ...opciones, abrir: false }).ejercicioDestinoId).toBe("");
        const api = opcionesCierreAApi(opcionesCierreAEnviar(regularizado, opciones));
        expect(api).toMatchObject({ fecha: "2026-12-31", cerrar: true, abrir: true, ejercicio_destino_id: "2027" });
    });

    test("«Reabrir Ejercicio» avisa de lo que se borra y de que queda abierto (A6)", () => {
        const e26 = ejercicio("2026", 2026, { estado: "CERRADO" });
        const texto = mensajeReabrir(e26, [ejercicio("2028", 2028), e26, ejercicio("2027", 2027)]);
        expect(texto).toContain("pérdidas y ganancias y de cierre del ejercicio 2026 — EJERCICIO 2026");
        expect(texto).toContain("asiento de apertura del ejercicio siguiente (2027 — EJERCICIO 2027)");
        expect(texto).toContain("El ejercicio 2026 quedará abierto");
        expect(mensajeReabrir(e26, [e26])).toContain("si lo hay");
    });

    test("reconoce el aviso de cuentas sin código de balance", () => {
        const error = { estado: 409, descripcion: "CUENTAS_SIN_CODIGO_BALANCE: Algunas subcuentas..." };
        expect(esAvisoCuentasSinCodigoBalance(error)).toBe(true);
        expect(textoAviso(error)).toBe("Algunas subcuentas...");
        expect(esAvisoCuentasSinCodigoBalance({ estado: 409, descripcion: "otro" })).toBe(false);
        expect(esAvisoCuentasSinCodigoBalance({ estado: 400, descripcion: "CUENTAS_SIN_CODIGO_BALANCE" })).toBe(false);
    });
});
