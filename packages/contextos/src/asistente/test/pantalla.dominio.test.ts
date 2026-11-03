import { describe, expect, test, vi } from "vitest";
import type { DescripcionControl, DescripcionListado } from "@olula/lib/controles_pantalla.ts";
import {
    accionPantallaDesdeApi, construirContextoPantalla, eventoStreamDesdeApi, interpretarOrdenPantalla,
    normalizarRespuestaIa, pantallaAApi,
} from "#/asistente/dominio.ts";
import { consultaAApi } from "#/asistente/infraestructura.ts";

vi.mock("@olula/lib/dominio.ts", () => ({ puede: () => true }));
vi.mock("#/valores/empresaActual.ts", () => ({ empresaActual: () => "emp-1" }));

const listado = (parcial: Partial<DescripcionListado> = {}): DescripcionListado => ({
    tipo: "listado", id: "listado-1", campos: [{ id: "cliente", etiqueta: "Cliente", tipo: "texto" }],
    columnasOrden: [{ id: "total", etiqueta: "Total" }], filtro: [], orden: ["id", "DESC"], pagina: 1, total: 30,
    filas: [
        { posicion: 1, id: "p1", texto: "PED-1 · Acme" },
        { posicion: 2, id: "p2", texto: "PED-2 · Beta" },
        { posicion: 3, id: "p3", texto: "PED-3 · Gamma" },
    ],
    seleccionada: null, modo: "tarjetas", modos: ["tarjetas", "tabla"],
    ...parcial,
});

const controles: DescripcionControl[] = [
    listado(),
    { tipo: "pestanas", id: "pestanas-1", pestanas: ["General", "Líneas"], activa: 0 },
    { tipo: "detalle", id: "detalle-1" },
];

describe("[asistente-pantalla-01] contexto de pantalla", () => {
    const capacidades = [{ ruta: "/ventas/pedido", nombre: "Pedidos", descripcion: "Listado de pedidos" }];

    test("ruta, nombre del menú, registro abierto y su descripción", () => {
        const ctx = construirContextoPantalla(
            "/ventas/pedido", "?id=p2&cliente=Acme",
            [listado({ seleccionada: { id: "p2", texto: "PED-2 · Beta" } })], capacidades);
        expect(ctx).toMatchObject({
            ruta: "/ventas/pedido", nombre: "Pedidos", idActivo: "p2", descripcionActivo: "PED-2 · Beta",
        });
    });

    test("sin registro abierto ni pantalla conocida", () => {
        expect(construirContextoPantalla("/otra", "", [], capacidades)).toEqual({
            ruta: "/otra", nombre: null, idActivo: null, descripcionActivo: null, controles: [],
        });
    });

    test("viaja en snake_case dentro de contexto_app", () => {
        const pantalla = construirContextoPantalla("/ventas/pedido", "?id=p1", controles, capacidades);
        const api = consultaAApi({ pregunta: "x", threadId: null, contextoApp: { rutaActual: "/ventas/pedido", pantalla } });
        expect(api.contexto_app).toMatchObject({
            ruta_actual: "/ventas/pedido",
            pantalla: { ruta: "/ventas/pedido", nombre: "Pedidos", id_activo: "p1" },
        });
        expect((pantallaAApi(pantalla).controles as Record<string, unknown>[])[0]).toMatchObject({
            tipo: "listado", id: "listado-1", columnas_orden: [{ id: "total", etiqueta: "Total" }],
        });
    });

    test("acciones de pantalla en la respuesta y en el stream", () => {
        const accion = { control: "listado-1", accion: "filtrar", parametros: { campo: "cliente", valor: "Acme" } };
        expect(normalizarRespuestaIa({ acciones_pantalla: [accion, { mal: 1 }] }).accionesPantalla).toEqual([accion]);
        expect(eventoStreamDesdeApi({ tipo: "accion_pantalla", accion_pantalla: accion }))
            .toEqual({ tipo: "accion_pantalla", accionPantalla: accion });
        expect(accionPantallaDesdeApi({ control: "x" })).toBeNull();
    });
});

describe("[asistente-pantalla-02] órdenes de pantalla resueltas al momento", () => {
    test.each([
        ["siguiente página", { control: "listado-1", accion: "pagina", parametros: { pagina: "siguiente" } }],
        ["la página anterior", { control: "listado-1", accion: "pagina", parametros: { pagina: "anterior" } }],
        ["ve a la página 3", { control: "listado-1", accion: "pagina", parametros: { pagina: 3 } }],
        ["página dos", { control: "listado-1", accion: "pagina", parametros: { pagina: 2 } }],
        ["abre el tercero", { control: "listado-1", accion: "seleccionar", parametros: { posicion: 3 } }],
        ["la segunda factura", { control: "listado-1", accion: "seleccionar", parametros: { posicion: 2 } }],
        ["el último", { control: "listado-1", accion: "seleccionar", parametros: { posicion: 3 } }],
        ["abre el número 2", { control: "listado-1", accion: "seleccionar", parametros: { posicion: 2 } }],
        ["quita los filtros", { control: "listado-1", accion: "quitar_filtros", parametros: {} }],
        ["vista de tabla", { control: "listado-1", accion: "modo", parametros: { modo: "tabla" } }],
        ["ve a la pestaña líneas", { control: "pestanas-1", accion: "seleccionar", parametros: { pestana: "Líneas" } }],
        ["cierra", { control: "detalle-1", accion: "cerrar", parametros: {} }],
        ["cierra el detalle", { control: "detalle-1", accion: "cerrar", parametros: {} }],
    ])("«%s»", (texto, esperado) => {
        expect(interpretarOrdenPantalla(texto, controles)).toEqual(esperado);
    });

    test("«el siguiente» es el siguiente registro si hay uno abierto, si no la siguiente página", () => {
        expect(interpretarOrdenPantalla("el siguiente", controles))
            .toMatchObject({ accion: "pagina", parametros: { pagina: "siguiente" } });
        expect(interpretarOrdenPantalla("el siguiente", [listado({ seleccionada: { id: "p1", texto: null } })]))
            .toMatchObject({ accion: "seleccionar", parametros: { relativa: "siguiente" } });
    });

    test("«cierra» cierra antes un modal abierto que el detalle", () => {
        expect(interpretarOrdenPantalla("cierra", [...controles, { tipo: "modal", id: "modal-1", titulo: "Nuevo" }]))
            .toEqual({ control: "modal-1", accion: "cerrar", parametros: {} });
    });

    test.each([
        "cuántos pedidos tengo pendientes",
        "abre los pedidos de Acme",
        "filtra por cliente Acme",
        "vista de kanban",
        "ve a la pestaña inventada",
        "tres pedidos de Beta",
    ])("«%s» va al asistente", texto => {
        expect(interpretarOrdenPantalla(texto, controles)).toBeNull();
    });

    test("sin listado en pantalla no hay órdenes de listado", () => {
        expect(interpretarOrdenPantalla("siguiente página", [])).toBeNull();
        expect(interpretarOrdenPantalla("cierra", [])).toBeNull();
    });
});
