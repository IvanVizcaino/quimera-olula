import { procesarEvento } from "@olula/lib/dominio.js";
import { describe, expect, test } from "vitest";
import { nuevaRegularizacionInicial } from "../../stock/regularizar/regularizar.ts";
import { fechaLocalAApi } from "../../stock/infraestructura.ts";
import { contextoDetalleInventarioInicial } from "../vistas/detalle/dominio.ts";
import { getMaquina } from "../vistas/detalle/maquina.ts";

describe("Inventario y regularización de stock", () => {
    test("la fecha se envía a la API en hora local", () => {
        expect(fechaLocalAApi(new Date(2026, 10, 3, 23, 59))).toBe("2026-11-03");
    });

    test("la regularización parte de la cantidad actual del stock", () => {
        const nueva = nuevaRegularizacionInicial(4);
        expect(nueva.cantidad).toBe(4);
        expect(nueva.hora).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });

    test("el detalle abre y cancela los modales de líneas", async () => {
        const maquina = getMaquina();
        const abierto = { ...contextoDetalleInventarioInicial, estado: "ABIERTO" as const };
        const [creando] = await procesarEvento(maquina, abierto, "crear_linea_solicitado", undefined);
        expect(creando.estado).toBe("CREANDO_LINEA");
        const [cancelado] = await procesarEvento(maquina, creando, "alta_de_linea_cancelada", undefined);
        expect(cancelado.estado).toBe("ABIERTO");
        const [cargando] = await procesarEvento(maquina, abierto, "cargar_lecturas_solicitado", undefined);
        expect(cargando.estado).toBe("CARGANDO_LECTURAS");
    });
});
