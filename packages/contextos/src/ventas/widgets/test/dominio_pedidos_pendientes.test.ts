import { describe, expect, test } from "vitest";
import {
    filtroPedidosPendientesServir,
    urlListadoPedidosPendientes,
} from "../dominio_pedidos_pendientes.ts";

describe("widget pedidos pendientes", () => {
    test("excluye pedidos totalmente servidos", () => {
        expect(filtroPedidosPendientesServir()).toEqual([
            ["servido", "!in", "Sí,TOTAL,SERVIDO"],
        ]);
    });

    test("enlace al maestro con el mismo filtro", () => {
        const url = urlListadoPedidosPendientes();
        expect(url).toContain("/ventas/pedido?");
        expect(url).toContain("servido");
        expect(url).toContain("S%C3%AD");
    });
});
