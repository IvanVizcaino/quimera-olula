import { crearApiDemo, rutaDeUrl } from "../demo/api_demo.ts";
import { DEMOS, tieneDemo, urlDemo } from "../demo/registro.ts";

const datos = () => ({
    "crm/accion": [
        { id: "1", descripcion: "Llamar", fecha: "2026-11-02" },
        { id: "2", descripcion: "Visitar", fecha: "2026-11-01" },
        { id: "3", descripcion: "Enviar", fecha: "2026-11-03" },
    ],
});

const q = (criteria: object) => `?q=${encodeURIComponent(JSON.stringify(criteria))}`;

describe("API en memoria de las demos", () => {
    test("ruta sin origen, prefijo de la API ni query", () => {
        expect(rutaDeUrl("http://h:5173/_api/crm/accion/3?q=x", "/_api")).toBe("crm/accion/3");
        expect(rutaDeUrl("/crm/accion", "")).toBe("crm/accion");
    });

    test("lista con total, orden y paginación", () => {
        const { responder } = crearApiDemo(datos());
        const r = responder("GET", `/crm/accion${q({ orden: ["fecha", "DESC"], paginacion: { limite: 2, pagina: 1 } })}`, null);
        expect(r.cuerpo).toEqual({
            datos: [expect.objectContaining({ id: "3" }), expect.objectContaining({ id: "1" })],
            total: 3,
        });
    });

    test("registro, alta, cambio y borrado", () => {
        const { responder } = crearApiDemo(datos());
        expect(responder("GET", "/crm/accion/2", null).cuerpo).toEqual({ datos: expect.objectContaining({ descripcion: "Visitar" }) });
        const { id } = responder("POST", "/crm/accion", { descripcion: "Nueva" }).cuerpo as { id: string };
        expect(responder("GET", `/crm/accion/${id}`, null).cuerpo).toEqual({ datos: { descripcion: "Nueva", id } });
        responder("PATCH", "/crm/accion/2", { descripcion: "Visita cambiada", id: "otro" });
        expect(responder("GET", "/crm/accion/2", null).cuerpo).toEqual({ datos: expect.objectContaining({ id: "2", descripcion: "Visita cambiada" }) });
        responder("DELETE", "/crm/accion/1", null);
        expect((responder("GET", "/crm/accion", null).cuerpo as { total: number }).total).toBe(3);
        expect(responder("GET", "/crm/accion/1", null).estado).toBe(404);
    });

    test("lo desconocido responde vacío en lecturas y «hecho» en escrituras", () => {
        const { responder } = crearApiDemo(datos());
        expect(responder("GET", "/ventas/cliente?q=1", null).cuerpo).toEqual({ datos: [], total: 0 });
        expect(responder("POST", "/crm/accion/2/cerrar", {}).estado).toBe(200);
    });

    test("respuestas fijas antes que las colecciones, también calculadas", () => {
        const { responder } = crearApiDemo(datos(), [
            { metodo: "POST", ruta: "analisis/cubo", cuerpo: { filas: [1] } },
            { metodo: "GET", ruta: /^crm\/accion\/\d+\/resumen$/, cuerpo: ({ url }: { url: string }) => ({ url }) },
            {
                metodo: "POST", ruta: /^crm\/accion\/\d+\/duplicar$/,
                cuerpo: ({ tramos, colecciones, nuevoId }: import("../demo/api_demo.ts").PeticionDemo) => {
                    const id = nuevoId();
                    const original = colecciones["crm/accion"].find((r) => r.id === tramos[2])!;
                    colecciones["crm/accion"].push({ ...original, id });
                    return { id };
                },
            },
        ]);
        expect(responder("POST", "/analisis/cubo", {}).cuerpo).toEqual({ filas: [1] });
        expect(responder("GET", "/crm/accion/2/resumen", null).cuerpo).toEqual({ url: "/crm/accion/2/resumen" });
        expect(responder("GET", "/analisis/cubo", null).cuerpo).toEqual({ datos: [], total: 0 });
        const { id } = responder("POST", "/crm/accion/2/duplicar", {}).cuerpo as { id: string };
        expect(responder("GET", `/crm/accion/${id}`, null).cuerpo).toEqual({ datos: expect.objectContaining({ descripcion: "Visitar" }) });
    });

    test("los cambios no tocan los datos de partida", () => {
        const origen = datos();
        const { responder } = crearApiDemo(origen);
        responder("PATCH", "/crm/accion/1", { descripcion: "x" });
        expect(origen["crm/accion"][0].descripcion).toBe("Llamar");
    });

    test("registro de demos", () => {
        expect(tieneDemo("crm")).toBe(true);
        expect(tieneDemo("no_existe")).toBe(false);
        expect(urlDemo("crm")).toBe("/demo.html?modulo=crm");
        for (const demo of Object.values(DEMOS)) {
            expect(demo.pantallas.length).toBeGreaterThan(0);
            expect(demo.pantallas.every((p) => p.ruta.startsWith("/"))).toBe(true);
            for (const registros of Object.values(demo.colecciones)) {
                expect(registros.every((r) => typeof r.id === "string")).toBe(true);
            }
        }
    });
});
