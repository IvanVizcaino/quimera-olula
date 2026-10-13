import { facturaDesdeAPI, lineaFacturaDesdeApi } from "#/ventas/factura/infraestructura.ts";
import { direccionVacia } from "#/ventas/venta/dominio.ts";
import { describe, expect, test } from "vitest";

type FacturaAPI = Parameters<typeof facturaDesdeAPI>[0];

const facturaApi: FacturaAPI = {
    id: "fac-1",
    codigo: "20260A000020",
    fecha: "2026-02-11",
    hora: "10:30:00",
    cliente_id: "000001",
    nombre_cliente: "Cliente 1",
    id_fiscal: "77716433P",
    direccion_id: "7",
    direccion: direccionVacia(),
    agente_id: "",
    nombre_agente: "",
    divisa_id: "EUR",
    tasa_conversion: 1,
    total: 207.62,
    neto: 177.48,
    total_iva: 30.14,
    total_irpf: 0,
    total_recargo: 0,
    total_divisa_empresa: 207.62,
    por_descuento: 0,
    neto_sin_dto: 0,
    forma_pago_id: "CONT",
    nombre_forma_pago: "CONTADO",
    almacen_id: "ALG",
    nombre_almacen: "ALMACEN GENERAL",
    automatica: false,
    servicios: false,
    rectificativa_id: null,
    grupo_iva_negocio_id: "GENERAL",
    por_comision: 0,
    observaciones: "",
    estado_expedicion: "",
};

describe("facturaDesdeAPI mapea la cabecera", () => {
    const factura = facturaDesdeAPI(facturaApi);

    test("el grupo de IVA de negocio llega tal cual y no se pisa", () => {
        expect(factura.grupo_iva_negocio_id).toBe("GENERAL");
    });

    test("la fecha llega como Date", () => {
        expect(factura.fecha).toBeInstanceOf(Date);
        expect(factura.fecha.toISOString().slice(0, 10)).toBe("2026-02-11");
    });

    test("el cliente se agrupa bajo su propia clave", () => {
        expect(factura.cliente.cliente_id).toBe("000001");
        expect(factura.cliente.id_fiscal).toBe("77716433P");
        expect(factura.cliente.direccion_id).toBe("7");
    });

    test("el descuento llega con los nombres del dominio", () => {
        const conDescuento = facturaDesdeAPI({
            ...facturaApi,
            por_descuento: 10,
            neto_sin_dto: 197.2,
        });
        expect(conDescuento.dtoPorcentual).toBe(10);
        expect(conDescuento.netoSinDto).toBe(197.2);
    });

    test("punto_venta_id llega mapeado (null cuando el campo viene ausente)", () => {
        expect(facturaDesdeAPI(facturaApi).punto_venta_id).toBeNull();
    });

    test("punto_venta_id llega mapeado cuando el campo tiene valor", () => {
        const conPunto = facturaDesdeAPI({ ...facturaApi, punto_venta_id: "PV01" });
        expect(conPunto.punto_venta_id).toBe("PV01");
    });
});

describe("lineaFacturaDesdeApi trazabilidad", () => {
    test("mapea por_lotes y movimientos", () => {
        const linea = lineaFacturaDesdeApi({
            id: "l1",
            referencia: "R1",
            descripcion: "d",
            descripcion_articulo: null,
            cantidad: 1,
            pvp_unitario: 10,
            dto_porcentual: 0,
            dto_lineal: 0,
            pvp_total: 10,
            iva_incluido: false,
            grupo_iva_producto_id: "G",
            tipo_irpf: 0,
            tipo_recargo: 0,
            tipo_iva: 21,
            por_comision: 0,
            importe_comision: 0,
            por_lotes: true,
            movimientos: [{ id: "mv", lote_id: "LOT1", cantidad: 4 }],
        });
        expect(linea.porLotes).toBe(true);
        expect(linea.movimientos).toEqual([{ id: "mv", loteId: "LOT1", cantidad: 4 }]);
    });
});
