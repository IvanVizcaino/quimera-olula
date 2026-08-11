import type { ItemOrdenAlmacen } from "#/almacen/orden/diseño.ts";
import { ItemOrdenApi, itemOrdenDesdeApi } from "#/almacen/orden/infraestructura.ts";
import { describe, expect, test } from "vitest";

// ---------------------------------------------------------------------------
// [orden-infra-03] itemOrdenDesdeApi convierte un ItemOrdenApi (snake_case) al tipo dominio ItemOrdenAlmacen (camelCase)
// ---------------------------------------------------------------------------

describe("[orden-infra-03] itemOrdenDesdeApi convierte un ItemOrdenApi (snake_case) al tipo dominio ItemOrdenAlmacen (camelCase)", () => {
    const itemApi: ItemOrdenApi = {
        id: "ORD-001",
        fecha: "2026-06-21",
        tipo: "ENTRADA",
        abierta: true,
        estado: "PENDIENTE",
        descripcion: "DESCRIPCION",
        ubicacion_origen_id: "UBI-001",
        caja_origen_id: "CAJA-001",
        ubicacion_destino_id: "UBI-002",
        caja_destino_id: "CAJA-002",
    };

    test("mapea id correctamente", () => {
        const item: ItemOrdenAlmacen = itemOrdenDesdeApi(itemApi);
        expect(item.id).toBe("ORD-001");
    });

    test("mapea fecha correctamente", () => {
        const item: ItemOrdenAlmacen = itemOrdenDesdeApi(itemApi);
        expect(item.fecha).toBe("2026-06-21");
    });

    test("mapea tipo correctamente", () => {
        const item: ItemOrdenAlmacen = itemOrdenDesdeApi(itemApi);
        expect(item.tipo).toBe("ENTRADA");
    });

    test("mapea abierta correctamente", () => {
        const item: ItemOrdenAlmacen = itemOrdenDesdeApi(itemApi);
        expect(item.abierta).toBe(true);
    });

    test("mapea estado correctamente", () => {
        const item: ItemOrdenAlmacen = itemOrdenDesdeApi(itemApi);
        expect(item.estado).toBe("PENDIENTE");
    });

    test("mapea ubicacion_origen_id a idUbicacionOrigen", () => {
        const item: ItemOrdenAlmacen = itemOrdenDesdeApi(itemApi);
        expect(item.idUbicacionOrigen).toBe("UBI-001");
    });

    test("mapea caja_origen_id a idCajaOrigen", () => {
        const item: ItemOrdenAlmacen = itemOrdenDesdeApi(itemApi);
        expect(item.idCajaOrigen).toBe("CAJA-001");
    });

    test("mapea ubicacion_destino_id a idUbicacionDestino", () => {
        const item: ItemOrdenAlmacen = itemOrdenDesdeApi(itemApi);
        expect(item.idUbicacionDestino).toBe("UBI-002");
    });

    test("mapea caja_destino_id a idCajaDestino", () => {
        const item: ItemOrdenAlmacen = itemOrdenDesdeApi(itemApi);
        expect(item.idCajaDestino).toBe("CAJA-002");
    });

    test("mapea ubicacion_origen_id null a idUbicacionOrigen null", () => {
        const itemSinUbicacionOrigen: ItemOrdenApi = { ...itemApi, ubicacion_origen_id: null };
        const item: ItemOrdenAlmacen = itemOrdenDesdeApi(itemSinUbicacionOrigen);
        expect(item.idUbicacionOrigen).toBeNull();
    });

    test("mapea caja_origen_id null a idCajaOrigen null", () => {
        const itemSinCajaOrigen: ItemOrdenApi = { ...itemApi, caja_origen_id: null };
        const item: ItemOrdenAlmacen = itemOrdenDesdeApi(itemSinCajaOrigen);
        expect(item.idCajaOrigen).toBeNull();
    });
});
