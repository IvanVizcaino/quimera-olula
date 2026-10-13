import { lineaFacturaDesdeApi, LineaFacturaApi } from "#/compras/factura/infraestructura.ts";
import { describe, expect, test } from "vitest";

const lineaApiBase = (): LineaFacturaApi => ({
    id: "lin-1",
    factura_id: "fac-1",
    albaran_id: null,
    codigo_albaran: null,
    referencia: "REF-P",
    descripcion: "Línea",
    descripcion_articulo: "Artículo",
    cantidad: 3,
    pvp_unitario: 8,
    dto_porcentual: 0,
    dto_lineal: 0,
    pvp_sin_dto: 24,
    pvp_total: 24,
    grupo_iva_producto_id: "G1",
    tipo_iva: 21,
    tipo_recargo: 0,
    tipo_irpf: 0,
});

describe("lineaFacturaDesdeApi trazabilidad", () => {
    test("por_lotes y movimientos por defecto", () => {
        const linea = lineaFacturaDesdeApi(lineaApiBase());
        expect(linea.porLotes).toBe(false);
        expect(linea.movimientos).toEqual([]);
    });

    test("mapea movimientos de lote", () => {
        const linea = lineaFacturaDesdeApi({
            ...lineaApiBase(),
            por_lotes: true,
            movimientos: [{ id: "m2", lote_id: "L99", cantidad: 1.5 }],
        });
        expect(linea.porLotes).toBe(true);
        expect(linea.movimientos[0].loteId).toBe("L99");
    });
});
