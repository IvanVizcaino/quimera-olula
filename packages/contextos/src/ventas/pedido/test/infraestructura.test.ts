import { payloadPatchPedido, pedidoDesdeAPI } from "#/ventas/pedido/infraestructura.ts";
import { direccionVacia } from "#/ventas/venta/dominio.ts";
import { describe, expect, test } from "vitest";

type PedidoAPI = Parameters<typeof pedidoDesdeAPI>[0];

const pedidoApi: PedidoAPI = {
    id: "ped-1",
    codigo: "PED-001",
    fecha: "2026-03-20",
    fecha_salida: "2026-03-22",
    almacen_id: "ALM1",
    nombre_almacen: "Almacén central",
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
    servido: "No",
};

describe("pedidoDesdeAPI mapea los campos de salida y almacén", () => {
    test("la fecha de salida llega como Date", () => {
        const pedido = pedidoDesdeAPI(pedidoApi);
        expect(pedido.fecha_salida).toBeInstanceOf(Date);
        expect(pedido.fecha_salida?.toISOString().slice(0, 10)).toBe("2026-03-22");
    });

    test("una fecha de salida ausente queda en null", () => {
        const pedido = pedidoDesdeAPI({ ...pedidoApi, fecha_salida: null });
        expect(pedido.fecha_salida).toBe(null);
    });

    test("el almacén llega con id y nombre", () => {
        const pedido = pedidoDesdeAPI(pedidoApi);
        expect(pedido.almacen_id).toBe("ALM1");
        expect(pedido.nombre_almacen).toBe("Almacén central");
    });

    test("el grupo de IVA de negocio llega tal cual y no se pisa", () => {
        const pedido = pedidoDesdeAPI(pedidoApi);
        expect(pedido.grupo_iva_negocio_id).toBe("GENERAL");
    });
});

describe("payloadPatchPedido devuelve el grupo de IVA de negocio que se ve en pantalla", () => {
    test("el grupo viaja de vuelta sin perderse", () => {
        const pedido = pedidoDesdeAPI(pedidoApi);
        expect(payloadPatchPedido(pedido).cambios.grupo_iva_negocio_id).toBe("GENERAL");
    });
});

describe("payloadPatchPedido manda los campos nuevos", () => {
    test("la fecha de salida viaja como día", () => {
        const pedido = pedidoDesdeAPI(pedidoApi);
        expect(payloadPatchPedido(pedido).cambios.fecha_salida).toBe("2026-03-22");
    });

    test("una fecha de salida vacía viaja como null", () => {
        const pedido = { ...pedidoDesdeAPI(pedidoApi), fecha_salida: null };
        expect(payloadPatchPedido(pedido).cambios.fecha_salida).toBe(null);
    });

    test("el almacén viaja por id", () => {
        const pedido = pedidoDesdeAPI(pedidoApi);
        expect(payloadPatchPedido(pedido).cambios.almacen_id).toBe("ALM1");
    });
});

describe("pedidoDesdeAPI trae la serie del documento", () => {
    test("la serie llega como serie_id", () => {
        expect(pedidoDesdeAPI(pedidoApi).serie_id).toBe("A");
    });

    test("sin serie en la respuesta queda vacía", () => {
        expect(pedidoDesdeAPI({ ...pedidoApi, serie_id: undefined as unknown as string }).serie_id).toBe("");
    });
});
