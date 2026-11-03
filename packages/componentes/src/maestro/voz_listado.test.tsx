import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import {
    describirPantalla, ejecutarAccionPantalla, limpiarControlesPantalla, type DescripcionListado,
} from "@olula/lib/controles_pantalla.ts";
import { Criteria } from "@olula/lib/diseño.ts";
import { MetaTabla } from "../atomos/qtablacontrolada.tsx";
import { Listado } from "./Listado.tsx";
import { getMetaFiltroDefecto, MetaFiltro } from "./maestroFiltros/MaestroFiltrosActivoControlado.tsx";
import { aplicarFiltrosVoz, camposFiltroVoz, ejecutarAccionListado, valorFiltroDesdeVoz } from "./voz_listado.ts";
import { Tab, Tabs } from "../detalle/tabs/Tabs.tsx";

type Pedido = { id: string; codigo: string; cliente: string; total: number; fecha: string; servido: boolean };

const metaTabla: MetaTabla<Pedido> = [
    { id: "codigo", cabecera: "Código" },
    { id: "cliente", cabecera: "Cliente" },
    { id: "total", cabecera: "Total", tipo: "moneda" },
    { id: "fecha", cabecera: "Fecha", tipo: "fecha" },
    { id: "servido", cabecera: "Servido", tipo: "booleano" },
];

const metaFiltroEstado: MetaFiltro = {
    estado: {
        id: "estado", label: "Estado", tipo: "multiseleccion",
        opciones: [{ valor: "pendiente", descripcion: "Pendiente" }, { valor: "servido", descripcion: "Servido" }],
        filtro: (v) => (Array.isArray(v) && v.length ? ["estado", "in", v as unknown as string] : null),
    },
};

const pedidos: Pedido[] = [
    { id: "p1", codigo: "PED-1", cliente: "Acme", total: 100, fecha: "2026-10-01", servido: false },
    { id: "p2", codigo: "PED-2", cliente: "Beta", total: 50, fecha: "2026-10-02", servido: true },
    { id: "p3", codigo: "PED-3", cliente: "Gamma", total: 75, fecha: "2026-10-03", servido: false },
];

const criteria: Criteria = { filtro: [], orden: ["id", "DESC"], paginacion: { pagina: 1, limite: 2 } };

afterEach(() => limpiarControlesPantalla());

describe("[voz-listado-01] valores dictados → filtros del panel", () => {
    test("describe los campos filtrables con su tipo (y opciones)", () => {
        expect(camposFiltroVoz({ ...getMetaFiltroDefecto(metaTabla), ...metaFiltroEstado })).toEqual([
            { id: "codigo", etiqueta: "Código", tipo: "texto" },
            { id: "cliente", etiqueta: "Cliente", tipo: "texto" },
            { id: "total", etiqueta: "Total", tipo: "numeros" },
            { id: "fecha", etiqueta: "Fecha", tipo: "fechas" },
            { id: "servido", etiqueta: "Servido", tipo: "booleano" },
            {
                id: "estado", etiqueta: "Estado", tipo: "opciones",
                opciones: [{ valor: "pendiente", etiqueta: "Pendiente" }, { valor: "servido", etiqueta: "Servido" }],
            },
        ]);
    });

    test("convierte cada forma de valor y rechaza lo inválido", () => {
        const meta = { ...getMetaFiltroDefecto(metaTabla), ...metaFiltroEstado };
        expect(valorFiltroDesdeVoz(meta.cliente, " Acme ")).toBe("Acme");
        expect(valorFiltroDesdeVoz(meta.servido, "sí")).toBe(true);
        expect(valorFiltroDesdeVoz(meta.total, { desde: 100 })).toEqual([100, undefined]);
        expect(valorFiltroDesdeVoz(meta.fecha, { desde: "2026-10-01", hasta: "2026-10-31" }))
            .toEqual([new Date(2026, 9, 1), new Date(2026, 9, 31)]);
        expect(valorFiltroDesdeVoz(meta.estado, "pendiente")).toEqual(["pendiente"]);
        expect(valorFiltroDesdeVoz(meta.estado, "inventado")).toBeUndefined();
        expect(valorFiltroDesdeVoz(meta.fecha, { desde: "ayer" })).toBeUndefined();
    });

    test("aplica, sustituye y quita filtros como el panel, conservando cláusulas ajenas", () => {
        const meta = getMetaFiltroDefecto(metaTabla);
        const conAjena = [["empresa_id", "=", "1"], ["cliente", "~", "Beta"]] as Criteria["filtro"] as never;
        const r1 = aplicarFiltrosVoz(conAjena, meta, [{ campo: "cliente", valor: "Acme" }, { campo: "total", valor: { desde: 100 } }]);
        expect(r1).toEqual({ filtro: [["empresa_id", "=", "1"], ["cliente", "~", "Acme"], ["total", ">=", "100_"]] });

        const r2 = aplicarFiltrosVoz((r1 as { filtro: never }).filtro, meta, [{ campo: "cliente", valor: null }]);
        expect(r2).toEqual({ filtro: [["empresa_id", "=", "1"], ["total", ">=", "100_"]] });

        expect(aplicarFiltrosVoz([], meta, [{ campo: "inventado", valor: "x" }])).toHaveProperty("error");
    });
});

describe("[voz-listado-02] acciones sobre el listado", () => {
    const manejadores = () => ({
        metaTabla, metaFiltro: getMetaFiltroDefecto(metaTabla), criteria, filtroInicial: [],
        entidades: pedidos, totalEntidades: 5, seleccionada: "p1", modos: ["tarjetas", "tabla"],
        onCriteriaChanged: vi.fn(), onSeleccion: vi.fn(), cambiarModo: vi.fn(),
    });

    test("ordenar, paginar y cambiar de vista", () => {
        const m = manejadores();
        expect(ejecutarAccionListado(m, "ordenar", { campo: "total", direccion: "DESC" }).ok).toBe(true);
        expect(m.onCriteriaChanged).toHaveBeenLastCalledWith(expect.objectContaining({ orden: ["total", "DESC"] }));
        expect(ejecutarAccionListado(m, "ordenar", { campo: "password" }).ok).toBe(false);

        expect(ejecutarAccionListado(m, "pagina", { pagina: "siguiente" }).ok).toBe(true);
        expect(m.onCriteriaChanged).toHaveBeenLastCalledWith(
            expect.objectContaining({ paginacion: { pagina: 2, limite: 2 } }));
        expect(ejecutarAccionListado(m, "pagina", { pagina: 4 }).ok).toBe(false);

        expect(ejecutarAccionListado(m, "modo", { modo: "tabla" }).ok).toBe(true);
        expect(m.cambiarModo).toHaveBeenCalledWith("tabla");
        expect(ejecutarAccionListado(m, "modo", { modo: "kanban" }).ok).toBe(false);
    });

    test("seleccionar por posición, id o relativo", () => {
        const m = manejadores();
        expect(ejecutarAccionListado(m, "seleccionar", { posicion: 3 })).toEqual({ ok: true, mensaje: "Abro PED-3." });
        expect(m.onSeleccion).toHaveBeenLastCalledWith("p3");
        ejecutarAccionListado(m, "seleccionar", { id: "p2" });
        expect(m.onSeleccion).toHaveBeenLastCalledWith("p2");
        ejecutarAccionListado(m, "seleccionar", { relativa: "siguiente" });
        expect(m.onSeleccion).toHaveBeenLastCalledWith("p2");
        expect(ejecutarAccionListado(m, "seleccionar", { posicion: 9 }).ok).toBe(false);
    });

    test("quitar los filtros vuelve al filtro inicial", () => {
        const m = { ...manejadores(), filtroInicial: [["empresa_id", "=", "1"]] as never };
        ejecutarAccionListado(m, "quitar_filtros", {});
        expect(m.onCriteriaChanged).toHaveBeenLastCalledWith(expect.objectContaining({ filtro: [["empresa_id", "=", "1"]] }));
    });
});

describe("[voz-listado-03] Listado, pestañas y modal registrados en la pantalla", () => {
    test("un Listado montado se describe y se maneja a través del registro", () => {
        const onCriteriaChanged = vi.fn();
        const onSeleccion = vi.fn();
        const { unmount } = render(
            <Listado<Pedido> metaTabla={metaTabla} criteria={criteria} entidades={pedidos} totalEntidades={3}
                seleccionada="p2" onSeleccion={onSeleccion} onCriteriaChanged={onCriteriaChanged} />
        );

        const [listado] = describirPantalla() as DescripcionListado[];
        expect(listado).toMatchObject({
            id: "listado-1", tipo: "listado", total: 3,
            seleccionada: { id: "p2", texto: "PED-2 · Beta · 50 · 2026-10-02" },
        });
        expect(listado.filas[0]).toEqual({ posicion: 1, id: "p1", texto: "PED-1 · Acme · 100 · 2026-10-01" });

        expect(ejecutarAccionPantalla({ control: "listado-1", accion: "filtrar", parametros: { campo: "cliente", valor: "Acme" } }).ok)
            .toBe(true);
        expect(onCriteriaChanged).toHaveBeenCalledWith(expect.objectContaining({ filtro: [["cliente", "~", "Acme"]] }));
        ejecutarAccionPantalla({ control: "listado-1", accion: "seleccionar", parametros: { posicion: 1 } });
        expect(onSeleccion).toHaveBeenCalledWith("p1");

        unmount();
        expect(describirPantalla()).toEqual([]);
        expect(ejecutarAccionPantalla({ control: "listado-1", accion: "seleccionar", parametros: {} }).ok).toBe(false);
    });

    test("las pestañas se cambian por su nombre", () => {
        const { getByText } = render(
            <Tabs>
                <Tab label="General">contenido general</Tab>
                <Tab label="Líneas">contenido líneas</Tab>
            </Tabs>
        );
        expect(describirPantalla()).toEqual([{ id: "pestanas-1", tipo: "pestanas", pestanas: ["General", "Líneas"], activa: 0 }]);
        let resultado = { ok: false };
        act(() => {
            resultado = ejecutarAccionPantalla({ control: "pestanas-1", accion: "seleccionar", parametros: { pestana: "líneas" } });
        });
        expect(resultado.ok).toBe(true);
        expect(getByText("contenido líneas")).toBeTruthy();
    });
});
