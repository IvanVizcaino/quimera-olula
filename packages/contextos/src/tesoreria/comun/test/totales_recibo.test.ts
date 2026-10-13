import { totalesReciboListadoDesdeApi } from "#/tesoreria/comun/totales_recibo.ts";
import { describe, expect, test } from "vitest";

describe("totalesReciboListadoDesdeApi", () => {
    test("mapea snake_case del API a camelCase del dominio", () => {
        expect(
            totalesReciboListadoDesdeApi({
                importe_total: 1000.5,
                importe_pagado: 400.25,
                importe_pendiente: 600.25,
            })
        ).toEqual({
            importeTotal: 1000.5,
            importePagado: 400.25,
            importePendiente: 600.25,
        });
    });
});
