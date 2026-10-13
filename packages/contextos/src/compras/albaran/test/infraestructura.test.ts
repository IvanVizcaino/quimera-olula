import { lineaAlbaranDesdeApi, LineaAlbaranApi } from "#/compras/albaran/infraestructura.ts";
import { describe, expect, test } from "vitest";

const lineaApiBase = (): LineaAlbaranApi => ({
    id: "lin-1",
    albaran_id: "alb-1",
    pedido_id: null,
    linea_pedido_id: null,
    referencia: "REF-A",
    descripcion: "Línea",
    descripcion_articulo: "Artículo",
    cantidad: 5,
    pvp_unitario: 10,
    dto_porcentual: 0,
    dto_lineal: 0,
    pvp_sin_dto: 50,
    pvp_total: 50,
    grupo_iva_producto_id: "G1",
    tipo_iva: 21,
    tipo_recargo: 0,
    tipo_irpf: 0,
});

describe("lineaAlbaranDesdeApi trazabilidad", () => {
    test("por_lotes y movimientos por defecto", () => {
        const linea = lineaAlbaranDesdeApi(lineaApiBase());
        expect(linea.porLotes).toBe(false);
        expect(linea.movimientos).toEqual([]);
    });

    test("mapea movimientos de lote", () => {
        const linea = lineaAlbaranDesdeApi({
            ...lineaApiBase(),
            por_lotes: true,
            movimientos: [{ id: "m1", lote_id: "L001", cantidad: 2 }],
        });
        expect(linea.porLotes).toBe(true);
        expect(linea.movimientos).toEqual([{ id: "m1", loteId: "L001", cantidad: 2 }]);
    });
});
