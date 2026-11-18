import { describe, expect, test } from "vitest";
import { LineaOrdenAlmacen, OrdenAlmacen } from "../diseño.ts";
import { lineaOrdenVacia, pedidoUnicoDeOrden, textoCambioPedido } from "../dominio.ts";
import { cantidadPendiente } from "../pasos/lector.ts";

const linea = (parcial: Partial<LineaOrdenAlmacen>): LineaOrdenAlmacen => ({
    ...lineaOrdenVacia(),
    id: "1",
    sku: "414911",
    pasosPick: "SKU_CAJA",
    ...parcial,
});

describe("[cambio-pedido] marca de líneas cambiadas en el pedido", () => {
    test("sin cambio no hay marca", () => {
        expect(textoCambioPedido(linea({}))).toBeNull();
    });

    test("añadida", () => {
        expect(textoCambioPedido(linea({ cambioPedido: "ANADIDA" }))).toBe("Añadida en pedido");
    });

    test("cambiada muestra la cantidad anterior", () => {
        expect(textoCambioPedido(linea({ cambioPedido: "CAMBIADA", cantidadPedidoAnterior: 10 })))
            .toBe("Cambiada en pedido (antes 10)");
    });

    test("cambiada sin cantidad anterior", () => {
        expect(textoCambioPedido(linea({ cambioPedido: "CAMBIADA" }))).toBe("Cambiada en pedido");
    });

    test("borrada", () => {
        expect(textoCambioPedido(linea({ cambioPedido: "BORRADA", cantidadPedidoAnterior: 4 })))
            .toBe("Borrada en pedido");
    });

    test("una línea borrada a 0 no deja nada pendiente de recoger", () => {
        const borrada = linea({ cambioPedido: "BORRADA", cantidadPrevista: 0, cantidadPedidoAnterior: 4 });
        const orden = { tipo: "SALIDA", pasosPick: null, pasosDrop: null, lineas: [borrada] } as unknown as OrdenAlmacen;
        expect(cantidadPendiente(borrada, orden, "PICK")).toBe(0);
    });
});

describe("[pedido-unico] pedido de venta de la orden", () => {
    const conPedido = (id: string | null, codigo: string | null = null) =>
        linea({ pedidoVentaId: id, pedidoVenta: codigo, cliente: id ? `Cliente ${id}` : null });

    test("todas las líneas del mismo pedido devuelve ese pedido", () => {
        expect(pedidoUnicoDeOrden({ lineas: [conPedido("1", "PV-1"), conPedido("1", "PV-1")] }))
            .toEqual({ id: "1", codigo: "PV-1", cliente: "Cliente 1" });
    });

    test("líneas de varios pedidos devuelve null", () => {
        expect(pedidoUnicoDeOrden({ lineas: [conPedido("1"), conPedido("2")] })).toBeNull();
    });

    test("sin pedido devuelve null", () => {
        expect(pedidoUnicoDeOrden({ lineas: [conPedido(null)] })).toBeNull();
    });

    test("sin código usa el id", () => {
        expect(pedidoUnicoDeOrden({ lineas: [conPedido("7")] })?.codigo).toBe("7");
    });
});
