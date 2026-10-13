import { describe, expect, test } from "vitest";
import { criteriaInventarioValorado } from "../dominio.ts";
import {
    inventarioValoradoDesdeApi,
    lineaInventarioValoradoDesdeApi,
    urlReportInventarioValorado,
} from "../infraestructura.ts";

describe("mappers inventario valorado (T5.5)", () => {
    test("lineaInventarioValoradoDesdeApi", () => {
        const linea = lineaInventarioValoradoDesdeApi({
            almacen_id: "1",
            almacen_nombre: "Central",
            referencia: "CAFE01",
            descripcion: "Café molido",
            cantidad: 10,
            precio_unitario: 5.5,
            valor: 55,
            tipo_valoracion: "Coste medio",
        });

        expect(linea.id).toBe("1-CAFE01");
        expect(linea.valor).toBe(55);
        expect(linea.tipoValoracion).toBe("Coste medio");
    });

    test("inventarioValoradoDesdeApi mapea totales", () => {
        const informe = inventarioValoradoDesdeApi({
            lineas: [],
            totales: { total_general: 100, por_almacen: { "1": 100 } },
            total: 0,
        });

        expect(informe.totales.totalGeneral).toBe(100);
        expect(informe.totales.porAlmacen["1"]).toBe(100);
    });

    test("urlReportInventarioValorado", () => {
        const c = criteriaInventarioValorado({ almacenId: "ALM1" });
        expect(urlReportInventarioValorado(c)).toMatch(
            /^\/almacen\/informe\/inventario_valorado\/report\?q=/
        );
    });
});
