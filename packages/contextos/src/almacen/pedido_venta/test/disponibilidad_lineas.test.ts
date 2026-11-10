import { EstadoLinea } from "../diseño.ts";
import { estadosPorLinea, filasCompetencia, itemPedidoVentaVacio } from "../dominio.ts";
import { estadoLineaDesdeApi, EstadoLineaApi } from "../infraestructura.ts";

const api: EstadoLineaApi = {
    linea_id: 20,
    sku: "ART1",
    pendiente: 6,
    asignado: 2,
    estado: "parcial",
    competidores: [
        { pedido_id: 3, codigo: "P3", fecha: "2026-01-03", cliente: "C3", linea_id: 30, pendiente: 4, asignado: 0, posicion: "detras" },
        { pedido_id: 1, codigo: "P1", fecha: "2026-01-01", cliente: "C1", linea_id: 10, pendiente: 6, asignado: 6, posicion: "delante" },
        { pedido_id: 9, codigo: "P9", fecha: "2025-12-01", cliente: "C9", linea_id: 90, pendiente: 1, asignado: 1, posicion: "en_salida" },
    ],
};

const pedido = { ...itemPedidoVentaVacio, id: "2", codigo: "P2", cliente: "C2" };

describe("disponibilidad por línea", () => {
    test("mapea la respuesta de la API a dominio", () => {
        const estado = estadoLineaDesdeApi(api);

        expect(estado.lineaId).toBe("20");
        expect(estado.estado).toBe("parcial");
        expect(estado.competidores[1]).toMatchObject({ pedidoId: "1", lineaId: "10", posicion: "delante" });
        expect(estado.competidores[1].fecha).toBeInstanceOf(Date);
    });

    test("indexa los estados por id de línea", () => {
        const estados: EstadoLinea[] = [estadoLineaDesdeApi(api)];

        expect(Object.keys(estadosPorLinea(estados))).toEqual(["20"]);
    });

    test("intercala la propia línea entre los que van delante y los de detrás", () => {
        const filas = filasCompetencia(pedido, estadoLineaDesdeApi(api));

        expect(filas.map((f) => f.posicion)).toEqual(["en_salida", "delante", "propia", "detras"]);
        expect(filas[2]).toMatchObject({ id: "20", codigo: "P2", pendiente: 6, asignado: 2 });
    });
});
