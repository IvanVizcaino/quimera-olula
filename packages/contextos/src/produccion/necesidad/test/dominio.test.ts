import { describe, expect, it } from "vitest";
import { FilaPropuesta, Necesidad } from "../diseño.ts";
import {
    aFabricarInicial,
    erroresSeleccion,
    estadoSeleccion,
    filasAGenerar,
    filasTrasBuscar,
    filaDesdeNecesidad,
    filtrosNecesidadesAApi,
    filtrosNecesidadesIniciales,
    INCLUIR_COMPONENTES_POR_DEFECTO,
    motivoAFabricarNoValido,
    motivoFiltrosNoValidos,
    necesidadManual,
    noLanzables,
    ordenarFilas,
    ordenesPropuestas,
    queryNecesidades,
    seleccionarTodas,
} from "../dominio.ts";

const necesidad = (id: string, cambios: Partial<Necesidad> = {}): Necesidad => ({
    id, origen: "pedido", pedidoId: "", lineaPedidoId: "", clienteId: "", cliente: "", fechaPedido: "", fechaSalida: "",
    articuloId: "CAMISA", descripcion: "Camisa", tipoProcesoId: "CAMISAS", pendiente: null, cubierta: 0, existencias: 0,
    disponible: 0, porRecibir: 0, aFaltas: null, stockMinimo: 0, stockMaximo: 0, cantidadNecesaria: null, compuestos: [],
    cantidad: 10, lotes: [], ordenesAbiertas: [], avisos: [], lanzable: true, ...cambios,
});

const fila = (n: Necesidad, seleccionada = true, aFabricar?: string): FilaPropuesta =>
    ({ necesidad: n, seleccionada, aFabricar: aFabricar ?? aFabricarInicial(n.cantidad) });

describe("generar órdenes: filtros → q", () => {
    it("al abrir: en pedidos, cantidad completa de la configuración y componentes según la preferencia", () => {
        const f = filtrosNecesidadesIniciales();
        expect(f).toMatchObject({ enPedidos: true, enStock: false, bajoMinimo: false, pedidoCompleto: null, tipoFecha: "pedido" });
        expect(f.incluirComponentes).toBe(INCLUIR_COMPONENTES_POR_DEFECTO);
        expect(filtrosNecesidadesIniciales(true).incluirComponentes).toBe(true);
    });

    it("manda siempre las opciones y solo los filtros con valor; sin pedido_completo deja decidir al servidor", () => {
        expect(filtrosNecesidadesAApi(filtrosNecesidadesIniciales())).toEqual({
            en_pedidos: true, en_stock: false, bajo_minimo: false, incluir_componentes: false,
        });
    });

    it("bajo mínimo implica stock; el tipo de fecha solo con fechas; recorta textos", () => {
        const api = filtrosNecesidadesAApi({
            ...filtrosNecesidadesIniciales(), enPedidos: false, bajoMinimo: true, pedidoCompleto: false,
            familiaId: "TEJ", referenciaDesde: " A ", referenciaHasta: "Z", pedidoId: "P1", clienteId: "000001",
            tipoFecha: "salida", fechaDesde: "2026-11-01", fechaHasta: "",
        });
        expect(api).toEqual({
            en_pedidos: false, en_stock: true, bajo_minimo: true, incluir_componentes: false, pedido_completo: false,
            familia_id: "TEJ", referencia_desde: "A", referencia_hasta: "Z", pedido_id: "P1", cliente_id: "000001",
            fecha_desde: "2026-11-01", tipo_fecha: "salida",
        });
        const sinFechas = filtrosNecesidadesAApi({ ...filtrosNecesidadesIniciales(), tipoFecha: "salida" });
        expect(sinFechas.tipo_fecha).toBeUndefined();
    });

    it("el q va como JSON codificado", () => {
        const q = queryNecesidades({ ...filtrosNecesidadesIniciales(), pedidoCompleto: true });
        expect(q.startsWith("?q=")).toBe(true);
        expect(JSON.parse(decodeURIComponent(q.slice(3)))).toEqual({
            en_pedidos: true, en_stock: false, bajo_minimo: false, incluir_componentes: false, pedido_completo: true,
        });
    });

    it("valida dónde buscar y los rangos", () => {
        const base = filtrosNecesidadesIniciales();
        expect(motivoFiltrosNoValidos(base)).toBeNull();
        expect(motivoFiltrosNoValidos({ ...base, enPedidos: false })).toMatch(/dónde buscar/);
        expect(motivoFiltrosNoValidos({ ...base, enPedidos: false, bajoMinimo: true })).toBeNull();
        expect(motivoFiltrosNoValidos({ ...base, fechaDesde: "2026-12-01", fechaHasta: "2026-11-01" })).toMatch(/fecha/);
        expect(motivoFiltrosNoValidos({ ...base, referenciaDesde: "B", referenciaHasta: "A" })).toMatch(/referencia/);
    });
});

describe("generar órdenes: filas y cantidades", () => {
    it("la propuesta se edita con coma y 3 decimales", () => {
        expect(aFabricarInicial(12.3456)).toBe("12,346");
        expect(aFabricarInicial(1500)).toBe("1500");
        expect(motivoAFabricarNoValido("1,5")).toBeNull();
        expect(motivoAFabricarNoValido("1.234,5")).toBeNull();
        expect(motivoAFabricarNoValido("")).toMatch(/Indica/);
        expect(motivoAFabricarNoValido("abc")).toMatch(/número/);
        expect(motivoAFabricarNoValido("0")).toMatch(/mayor que cero/);
        expect(motivoAFabricarNoValido("1,2345")).toMatch(/3 decimales/);
    });

    it("al volver a buscar conserva selección y lo escrito, y deja las manuales al final", () => {
        const a = necesidad("pedido:1");
        const manual = necesidadManual({ id: "PANTALON", descripcion: "Pantalón", tipoProcesoId: "" }, 3, 1);
        const anteriores = [fila(a, true, "7"), manual];
        const nuevas = filasTrasBuscar(anteriores, [necesidad("stock:X", { origen: "stock", cantidad: 4 }), necesidad("pedido:1", { cantidad: 9 })]);
        expect(nuevas.map((f) => [f.necesidad.id, f.seleccionada, f.aFabricar])).toEqual([
            ["stock:X", false, "4"], ["pedido:1", true, "7"], ["manual:1", true, "3"],
        ]);
        expect(nuevas[1].necesidad.cantidad).toBe(9);
    });

    it("seleccionar todo y su estado", () => {
        const filas = [fila(necesidad("a"), false), fila(necesidad("b"), true)];
        expect(estadoSeleccion(filas)).toBe("algunas");
        expect(estadoSeleccion(seleccionarTodas(filas, true))).toBe("todas");
        expect(estadoSeleccion(seleccionarTodas(filas, false))).toBe("ninguna");
        expect(estadoSeleccion([])).toBe("ninguna");
    });

    it("filas a generar: solo las elegidas; la línea de pedido solo en las de pedido", () => {
        const filas = [
            fila(necesidad("pedido:7", { lineaPedidoId: "7" }), true, "2,5"),
            fila(necesidad("stock:CAMISA", { origen: "stock", lineaPedidoId: "" }), true, "1"),
            fila(necesidad("pedido:8", { lineaPedidoId: "8" }), false, "5"),
            fila(necesidad("componente:TELA", { origen: "componente", articuloId: "TELA" }), true, "0"),
        ];
        expect(filasAGenerar(filas)).toEqual([
            { articuloId: "CAMISA", cantidad: 2.5, lineaPedidoId: "7" },
            { articuloId: "CAMISA", cantidad: 1, lineaPedidoId: "" },
        ]);
        expect(erroresSeleccion(filas)).toEqual(["TELA: La cantidad ha de ser mayor que cero"]);
    });
});

describe("generar órdenes: resumen", () => {
    it("una orden por artículo con la suma, sus pedidos y si se puede lanzar", () => {
        const filas = [
            fila(necesidad("pedido:1", { pedidoId: "P1", lineaPedidoId: "1" }), true, "1,25"),
            fila(necesidad("componente:TELA", { origen: "componente", articuloId: "TELA", descripcion: "Tela", lanzable: false }), true, "3"),
            fila(necesidad("pedido:2", { pedidoId: "P2", lineaPedidoId: "2" }), true, "2,5"),
            fila(necesidad("pedido:3", { pedidoId: "P1", lineaPedidoId: "3" }), true, "0,001"),
            fila(necesidad("pedido:4", { pedidoId: "P9", lineaPedidoId: "4" }), false, "100"),
        ];
        const ordenes = ordenesPropuestas(filas);
        expect(ordenes).toEqual([
            { articuloId: "CAMISA", descripcion: "Camisa", cantidad: 3.751, filas: 3, pedidos: ["P1", "P2"], lanzable: true },
            { articuloId: "TELA", descripcion: "Tela", cantidad: 3, filas: 1, pedidos: [], lanzable: false },
        ]);
        expect(noLanzables(ordenes)).toEqual(["TELA"]);
    });

    it("ignora cantidades no válidas y sin selección no hay órdenes", () => {
        expect(ordenesPropuestas([fila(necesidad("a"), true, "x")])).toEqual([]);
        expect(ordenesPropuestas([fila(necesidad("a"), false)])).toEqual([]);
    });

    it("ordena por cliente o referencia de forma estable, y seleccionadas primero", () => {
        const filas = [
            fila(necesidad("1", { articuloId: "B", cliente: "Zeta" }), false),
            fila(necesidad("2", { articuloId: "A", cliente: "" }), true),
            fila(necesidad("3", { articuloId: "C", cliente: "Alfa" }), false),
        ];
        const ids = (fs: FilaPropuesta[]) => fs.map((f) => f.necesidad.id);
        expect(ids(ordenarFilas(filas, "busqueda"))).toEqual(["1", "2", "3"]);
        expect(ids(ordenarFilas(filas, "cliente"))).toEqual(["3", "1", "2"]);
        expect(ids(ordenarFilas(filas, "referencia"))).toEqual(["2", "1", "3"]);
        expect(ids(ordenarFilas(filas, "seleccionadas"))).toEqual(["2", "1", "3"]);
    });

    it("la línea manual va elegida, sin pedido y no lanzable sin tipo de proceso", () => {
        const m = necesidadManual({ id: "X", descripcion: "Equis", tipoProcesoId: "" }, 2, 5);
        expect(m.seleccionada).toBe(true);
        expect(m.necesidad).toMatchObject({ id: "manual:5", origen: "manual", lanzable: false, lineaPedidoId: "" });
        expect(m.necesidad.avisos[0]).toMatch(/tipo de proceso/);
        expect(necesidadManual({ id: "X", descripcion: "", tipoProcesoId: "TP" }, 2, 6).necesidad.lanzable).toBe(true);
        expect(filaDesdeNecesidad(necesidad("z")).seleccionada).toBe(false);
    });
});
