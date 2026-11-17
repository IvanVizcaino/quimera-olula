import { afterEach, describe, expect, test } from "vitest";
import { SubcuentaTercero } from "../diseño.ts";
import { mostrarPestanaContabilidad, subcuentaInicial } from "../dominio.ts";
import {
    partidaSubcuentaDesdeApi,
    subcuentaTerceroDesdeApi,
    urlPartidasSubcuenta,
    urlSubcuentasTercero,
} from "../infraestructura.ts";

const subcuenta = (id: string, ejercicioId: string): SubcuentaTercero => ({
    id,
    ejercicioId,
    subcuentaId: `9${id}`,
    codigoSubcuenta: "4300000001",
    descripcion: "CLIENTE",
    saldo: 0,
});

describe("subcuentas de tercero: infraestructura", () => {
    test("subcuentaTerceroDesdeApi mapea snake_case a dominio", () => {
        expect(
            subcuentaTerceroDesdeApi({
                id: 3,
                ejercicio_id: "2026",
                subcuenta_id: 230,
                codigo_subcuenta: "4300000001",
                descripcion: "CLIENTE UNO",
                saldo: 69.47,
            })
        ).toEqual({
            id: "3",
            ejercicioId: "2026",
            subcuentaId: "230",
            codigoSubcuenta: "4300000001",
            descripcion: "CLIENTE UNO",
            saldo: 69.47,
        });
    });

    test("partidaSubcuentaDesdeApi trae fecha, asiento y saldo", () => {
        const partida = partidaSubcuentaDesdeApi({
            id: 6,
            asiento_id: 4,
            numero_asiento: 12,
            fecha: "2026-03-05",
            concepto: "Factura A-1",
            debe: 45.27,
            haber: 0,
            saldo: 69.47,
        });
        expect(partida.id).toBe("6");
        expect(partida.asientoId).toBe("4");
        expect(partida.numeroAsiento).toBe(12);
        expect(partida.fecha.getFullYear()).toBe(2026);
        expect(partida.fecha.getMonth()).toBe(2);
        expect(partida.fecha.getDate()).toBe(5);
        expect(partida.debe).toBe(45.27);
        expect(partida.haber).toBe(0);
        expect(partida.saldo).toBe(69.47);
    });

    test("urls de cliente, proveedor y partidas", () => {
        expect(urlSubcuentasTercero("cliente", "000001")).toBe(
            "/contabilidad/subcuentas_cliente/000001"
        );
        expect(urlSubcuentasTercero("proveedor", "P 1")).toBe(
            "/contabilidad/subcuentas_proveedor/P%201"
        );
        expect(urlPartidasSubcuenta("230")).toBe(
            "/contabilidad/subcuenta/230/partida"
        );
    });
});

describe("subcuentas de tercero: dominio", () => {
    afterEach(() => localStorage.clear());

    test("subcuentaInicial elige el ejercicio más reciente", () => {
        const lista = [subcuenta("1", "2025"), subcuenta("2", "2026"), subcuenta("3", "2024")];
        expect(subcuentaInicial(lista)?.id).toBe("2");
    });

    test("subcuentaInicial sin subcuentas", () => {
        expect(subcuentaInicial([])).toBeNull();
    });

    test("la pestaña se ve con contabilidad integrada", () => {
        localStorage.setItem(
            "whoami",
            JSON.stringify({ config: { contabilidad: { contabilidad_integrada: true } } })
        );
        expect(mostrarPestanaContabilidad()).toBe(true);
    });

    test("la pestaña no se ve sin contabilidad integrada", () => {
        localStorage.setItem(
            "whoami",
            JSON.stringify({ config: { contabilidad: { contabilidad_integrada: false } } })
        );
        expect(mostrarPestanaContabilidad()).toBe(false);
    });

    test("la pestaña no se ve si el whoami no trae la config de contabilidad", () => {
        localStorage.setItem("whoami", JSON.stringify({ config: {} }));
        expect(mostrarPestanaContabilidad()).toBe(false);
    });
});
