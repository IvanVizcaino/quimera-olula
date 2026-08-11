import type { LineaOrdenAlmacenApi } from "#/almacen/orden/infraestructura.ts";
import {
    lineaOrdenDesdeApi,
} from "#/almacen/orden/infraestructura.ts";
import { describe, expect, test } from "vitest";

// ---------------------------------------------------------------------------
// [orden-infra-01] lineaOrdenDesdeApi convierte de snake_case API a camelCase dominio
// ---------------------------------------------------------------------------

describe("[orden-infra-01] lineaOrdenDesdeApi convierte correctamente de snake_case API a camelCase dominio", () => {
    const lineaApi: LineaOrdenAlmacenApi = {
        id: "linea-1",
        sku: "PROD-001",
        articulo: "Producto 001",
        lote_id: "LOTE-123",
        cantidad_prevista: 10,
        ubicacion_origen_id: "1",
        ubicacion_origen: "UBI-001",
        caja_origen_id: null,
        caja_origen: null,
        ubicacion_destino_id: "2",
        ubicacion_destino: "UBI-002",
        caja_destino_id: null,
        caja_destino: null,
        lecturas: [],
    };

    test("mapea sku correctamente", () => {
        const linea = lineaOrdenDesdeApi(lineaApi);
        expect(linea.sku).toBe("PROD-001");
    });

    test("mapea lote_id a loteId", () => {
        const linea = lineaOrdenDesdeApi(lineaApi);
        expect(linea.loteId).toBe("LOTE-123");
    });

    test("mapea cantidad_prevista a cantidadPrevista", () => {
        const linea = lineaOrdenDesdeApi(lineaApi);
        expect(linea.cantidadPrevista).toBe(10);
    });

    test("mapea ubicacion_origen_id a idUbicacionOrigen", () => {
        const linea = lineaOrdenDesdeApi(lineaApi);
        expect(linea.idUbicacionOrigen).toBe("1");
    });

    test("mapea caja_origen_id a idCajaOrigen (null)", () => {
        const linea = lineaOrdenDesdeApi(lineaApi);
        expect(linea.idCajaOrigen).toBeNull();
    });

    test("mapea ubicacion_destino_id a idUbicacionDestino", () => {
        const linea = lineaOrdenDesdeApi(lineaApi);
        expect(linea.idUbicacionDestino).toBe("2");
    });

    test("mapea caja_destino_id a idCajaDestino (null)", () => {
        const linea = lineaOrdenDesdeApi(lineaApi);
        expect(linea.idCajaDestino).toBeNull();
    });

    test("mapea lote_id null correctamente", () => {
        const lineaSinLote: LineaOrdenAlmacenApi = { ...lineaApi, lote_id: null };
        const linea = lineaOrdenDesdeApi(lineaSinLote);
        expect(linea.loteId).toBeNull();
    });
});

