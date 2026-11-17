import { albaranDesdeAPI } from "#/ventas/albaran/infraestructura.ts";
import { direccionVacia } from "#/ventas/venta/dominio.ts";
import { describe, expect, test } from "vitest";

type AlbaranAPI = Parameters<typeof albaranDesdeAPI>[0];

const albaranApi: AlbaranAPI = {
    id: "alb-1",
    codigo: "ALB-001",
    fecha: "2026-03-20",
    hora: "10:30:00",
    almacen_id: "ALM1",
    nombre_almacen: "Almacén central",
    de_abono: true,
    cliente_id: "cli-1",
    nombre_cliente: "Cliente 1",
    id_fiscal: "12345678Z",
    serie_id: "A",
    direccion_id: "dir-1",
    direccion: direccionVacia(),
    agente_id: "",
    nombre_agente: "",
    divisa_id: "EUR",
    tasa_conversion: 1,
    total: 121,
    neto: 100,
    total_iva: 21,
    total_irpf: 0,
    total_recargo: 0,
    total_divisa_empresa: 121,
    por_descuento: 0,
    neto_sin_dto: 100,
    forma_pago_id: "CONT",
    nombre_forma_pago: "Contado",
    grupo_iva_negocio_id: "GENERAL",
    por_comision: 0,
    observaciones: "",
    facturado: false,
};

describe("albaranDesdeAPI mapea hora, almacén y abono", () => {
    const albaran = albaranDesdeAPI(albaranApi);

    test("la hora llega tal cual", () => {
        expect(albaran.hora).toBe("10:30:00");
    });

    test("el almacén llega con id y nombre", () => {
        expect(albaran.almacen_id).toBe("ALM1");
        expect(albaran.nombre_almacen).toBe("Almacén central");
    });

    test("el abono llega como booleano", () => {
        expect(albaran.de_abono).toBe(true);
        expect(albaranDesdeAPI({ ...albaranApi, de_abono: false }).de_abono).toBe(false);
    });

    test("el grupo de IVA de negocio llega tal cual y no se pisa", () => {
        expect(albaran.grupo_iva_negocio_id).toBe("GENERAL");
    });

    test("facturado llega como booleano y decide el bloqueo", () => {
        expect(albaran.facturado).toBe(false);
        expect(albaranDesdeAPI({ ...albaranApi, facturado: true }).facturado).toBe(true);
    });
});

describe("albaranDesdeAPI trae la serie del documento", () => {
    test("la serie llega como serie_id", () => {
        expect(albaranDesdeAPI(albaranApi).serie_id).toBe("A");
    });

    test("sin serie en la respuesta queda vacía", () => {
        expect(albaranDesdeAPI({ ...albaranApi, serie_id: undefined as unknown as string }).serie_id).toBe("");
    });
});
