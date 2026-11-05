import { ComponenteDashboard, RespuestaAgregado } from "./diseño.ts";
import {
  agruparResto,
  alternativasTipo,
  cambiarTipo,
  componenteDesdePropuesta,
  componentesDesdePropuestaDashboard,
  datosMapa,
  consultasEmbudo,
  encuadreMapa,
  pasosEmbudo,
  metricasMapa,
  aliasMetricas,
  categorias,
  consultaPorDefecto,
  etiquetaTramo,
  formatoPorDefecto,
  nuevoComponente,
  pieTarjeta,
  problemaComponente,
  queryConsulta,
  serieTemporal,
  sustituirComponente,
  variacion,
} from "./dominio.ts";

const respuesta = (cambios: Partial<RespuestaAgregado>): RespuestaAgregado => ({
  recurso: "ventas.factura",
  grupos: [],
  total_grupos: 0,
  truncado: false,
  totales: {},
  ...cambios,
});

const componente = (cambios: Partial<ComponenteDashboard>): ComponenteDashboard => ({
  id: "c1",
  tipo: "tarjeta",
  titulo: "Facturado",
  x: 0,
  y: 0,
  w: 3,
  h: 2,
  consultas: [{ recurso: "ventas.factura", metricas: "suma:total" }],
  opciones: {},
  ...cambios,
});

describe("dashboard: consultas", () => {
  test("query string con los parámetros de la REST", () => {
    const query = queryConsulta({
      recurso: "ventas.factura",
      metricas: "suma:total",
      agrupar: "fecha:mes",
      periodo: "fecha:ultimos_12_meses",
      comparar: "año_anterior",
      limite: 24,
      filtros: [{ campo: "agente", operador: "=", valor: "A1" }],
    });
    const parametros = new URLSearchParams(query.slice(1));
    expect(parametros.get("metricas")).toBe("suma:total");
    expect(parametros.get("comparar")).toBe("año_anterior");
    expect(parametros.get("limite")).toBe("24");
    expect(parametros.has("recurso")).toBe(false);
    expect(JSON.parse(parametros.get("filtros") ?? "")).toEqual([
      { campo: "agente", operador: "=", valor: "A1" },
    ]);
  });

  test("alias de las métricas en la respuesta", () => {
    expect(aliasMetricas("suma:total, conteo")).toEqual(["suma_total", "conteo"]);
    expect(aliasMetricas(undefined)).toEqual([]);
  });

  test("formato por defecto según la medida", () => {
    expect(formatoPorDefecto("suma:total")).toBe("moneda");
    expect(formatoPorDefecto("conteo")).toBe("numero");
    expect(formatoPorDefecto("suma:cantidad")).toBe("numero");
  });

  test("pie de tarjeta: métrica y periodo, como los widgets", () => {
    expect(pieTarjeta({ recurso: "ventas.factura", metricas: "suma:total", periodo: "fecha:este_mes" }))
      .toBe("Suma de total · Este mes");
    expect(pieTarjeta({ recurso: "ventas.pedido", metricas: "conteo" })).toBe("Recuento");
    expect(pieTarjeta({ recurso: "ventas.factura", metricas: "promedio:total", periodo: "fecha:este_año" }))
      .toBe("Media de total · Este año");
  });

  test("consulta por defecto de cada tipo", () => {
    expect(consultaPorDefecto("tarjeta", "ventas.factura", "total", "fecha")).toEqual({
      recurso: "ventas.factura",
      metricas: "suma:total",
      periodo: "fecha:este_mes",
      comparar: "año_anterior",
    });
    expect(consultaPorDefecto("temporal", "ventas.factura", "total", "fecha").agrupar).toBe(
      "fecha:mes"
    );
    expect(consultaPorDefecto("tarjeta", "compras.proveedor", undefined, undefined)).toEqual({
      recurso: "compras.proveedor",
      metricas: "conteo",
      periodo: undefined,
      comparar: undefined,
    });
  });
});

describe("dashboard: valores", () => {
  test("variación frente al otro periodo", () => {
    expect(variacion(112, 100)).toEqual({ texto: "+12 %", positiva: true });
    expect(variacion(50, 200)).toEqual({ texto: "-75 %", positiva: false });
    expect(variacion(10, 0)).toBeNull();
    expect(variacion(null, 3)).toBeNull();
  });

  test("etiquetas de tramo por granularidad", () => {
    expect(etiquetaTramo("2026-10-01", "mes")).toBe("oct 26");
    expect(etiquetaTramo("2026-07-01", "trimestre")).toBe("T3 26");
    expect(etiquetaTramo("2026-01-01", "año")).toBe("2026");
    expect(etiquetaTramo("2026-10-26", "semana")).toBe("26 oct");
  });

  test("serie temporal alineada con la comparación por posición", () => {
    const serie = serieTemporal(
      respuesta({
        grupos: [
          { fecha: "2026-09-01", suma_total: 10 },
          { fecha: "2026-10-01", suma_total: 0 },
        ],
        comparacion: respuesta({
          grupos: [
            { fecha: "2025-09-01", suma_total: 8 },
            { fecha: "2025-10-01", suma_total: 5 },
          ],
        }),
      }),
      { recurso: "ventas.factura", metricas: "suma:total", agrupar: "fecha:mes" }
    );
    expect(serie).toEqual([
      { etiqueta: "sep 26", actual: 10, anterior: 8 },
      { etiqueta: "oct 26", actual: 0, anterior: 5 },
    ]);
  });

  test("categorías con el nombre que da el servidor", () => {
    const lista = categorias(
      respuesta({
        grupos: [
          { cliente: "C1", cliente_nombre: "Cliente Uno", suma_total: 30 },
          { cliente: null, suma_total: 5 },
          { de_abono: true, suma_total: 1 },
        ],
      }),
      { recurso: "ventas.factura", metricas: "suma:total", agrupar: "cliente" }
    );
    expect(lista.map((c) => c.etiqueta)).toEqual(["Cliente Uno", "Sin valor", "Sin valor"]);
  });

  test("circular: las mayores y el resto en «Otros»", () => {
    const lista = [1, 9, 3, 7, 5, 2, 8].map((valor, i) => ({
      clave: `k${i}`,
      etiqueta: `E${i}`,
      valor,
    }));
    const agrupadas = agruparResto(lista, 4);
    expect(agrupadas.map((c) => c.valor)).toEqual([9, 8, 7, 11]);
    expect(agrupadas[3].etiqueta).toBe("Otros");
  });
});

describe("dashboard: componentes", () => {
  test("nuevo componente: id libre y primer hueco de la rejilla", () => {
    const existentes = [componente({ id: "c1", x: 0, y: 0, w: 8, h: 2 })];
    const nuevo = nuevoComponente("tarjeta", existentes);
    expect(nuevo).toMatchObject({ id: "c2", x: 8, y: 0, w: 3, h: 2, consultas: [] });
  });

  test("qué le falta a un componente para guardarse", () => {
    expect(problemaComponente(componente({}))).toBeNull();
    expect(problemaComponente(componente({ consultas: [] }))).toMatch(/de dónde/);
    expect(problemaComponente(componente({ tipo: "barras" }))).toMatch(/agrupar/);
    expect(
      problemaComponente(
        componente({ tipo: "tabla", consultas: [{ recurso: "ventas.factura", columnas: "" }] })
      )
    ).toMatch(/columna/);
    expect(problemaComponente(componente({ tipo: "objetivo" }))).toMatch(/meta/);
    expect(problemaComponente(componente({ tipo: "texto", consultas: [] }))).toBeNull();
  });

  test("sustituir un componente o añadirlo al final", () => {
    const lista = [componente({ id: "a" }), componente({ id: "b" })];
    expect(
      sustituirComponente(lista, componente({ id: "b", titulo: "Nuevo" })).map((c) => c.titulo)
    ).toEqual(["Facturado", "Nuevo"]);
    expect(sustituirComponente(lista, componente({ id: "c" }))).toHaveLength(3);
  });
});

describe("dashboard: mapa", () => {
  const consulta = {
    recurso: "ventas.factura",
    metricas: metricasMapa("suma:total"),
    agrupar: "provincia",
  };

  test("añade los clientes distintos a la métrica elegida", () => {
    expect(metricasMapa("suma:total")).toBe("suma:total,conteo_distinto:cliente");
    expect(metricasMapa("conteo,suma:neto")).toBe("conteo,conteo_distinto:cliente");
  });

  test("sitúa cada provincia por su código INE y aparta lo que no se puede situar", () => {
    const { puntos, sinSituar } = datosMapa(
      respuesta({
        grupos: [
          { provincia: "08", provincia_nombre: "Barcelona", suma_total: 100, conteo_distinto_cliente: 4 },
          { provincia: "28", suma_total: 300, conteo_distinto_cliente: 9 },
          { provincia: null, suma_total: 50, conteo_distinto_cliente: 2 },
          { provincia: "99", suma_total: 7, conteo_distinto_cliente: 1 },
        ],
      }),
      consulta
    );
    expect(puntos.map((p) => [p.nombre, p.valor, p.clientes])).toEqual([
      ["Madrid", 300, 9],
      ["Barcelona", 100, 4],
    ]);
    expect(puntos[0].centro).toEqual([-3.7038, 40.4168]);
    expect(sinSituar).toBe(57);
  });

  test("por comunidad", () => {
    const { puntos } = datosMapa(
      respuesta({ grupos: [{ comunidad: "16", suma_total: 5 }] }),
      { ...consulta, agrupar: "comunidad", metricas: "suma:total" }
    );
    expect(puntos).toEqual([
      { codigo: "16", nombre: "País Vasco", centro: [-2.62, 43.04], valor: 5, clientes: null },
    ]);
  });

  test("un mapa necesita agrupar por provincia o comunidad", () => {
    const mapa = componente({ tipo: "mapa", consultas: [{ ...consulta, agrupar: "cliente" }] });
    expect(problemaComponente(mapa)).toMatch(/provincia o comunidad/);
    expect(problemaComponente({ ...mapa, consultas: [consulta] })).toBeNull();
  });
});

describe("dashboard: encuadre del mapa", () => {
  const punto = (nombre: string, centro: [number, number]) => ({
    codigo: nombre,
    nombre,
    centro,
    valor: 1,
    clientes: null,
  });

  test("península y Baleares; Canarias aparte", () => {
    const madrid = punto("Madrid", [-3.7, 40.4]);
    const palma = punto("Palma", [2.65, 39.57]);
    const laspalmas = punto("Las Palmas", [-15.41, 28.12]);
    expect(encuadreMapa([madrid, palma, laspalmas])).toEqual({
      limites: [
        [-3.7, 39.57],
        [2.65, 40.4],
      ],
      fuera: [laspalmas],
    });
  });

  test("solo Canarias: se encuadra Canarias", () => {
    const laspalmas = punto("Las Palmas", [-15.41, 28.12]);
    expect(encuadreMapa([laspalmas])).toEqual({
      limites: [
        [-15.41, 28.12],
        [-15.41, 28.12],
      ],
      fuera: [],
    });
    expect(encuadreMapa([])).toEqual({ limites: null, fuera: [] });
  });
});

describe("dashboard: embudo", () => {
  test("una consulta por paso, solo los que el usuario puede ver", () => {
    expect(
      consultasEmbudo("ventas", "conteo", "este_año", ["ventas.pedido", "ventas.factura"])
    ).toEqual([
      { recurso: "ventas.pedido", metricas: "conteo", periodo: "fecha:este_año" },
      { recurso: "ventas.factura", metricas: "conteo", periodo: "fecha:este_año" },
    ]);
    expect(consultasEmbudo("inventado", "conteo", undefined, ["ventas.pedido"])).toEqual([]);
  });

  test("valor, conversión respecto al anterior y proporción", () => {
    const consultas = consultasEmbudo("compras", "suma:total", undefined, [
      "compras.pedido",
      "compras.albaran",
      "compras.factura",
    ]);
    const pasos = pasosEmbudo(
      [
        respuesta({ totales: { suma_total: 200 } }),
        respuesta({ totales: { suma_total: 0 } }),
        respuesta({ totales: { suma_total: 50 } }),
      ],
      consultas
    );
    expect(pasos).toEqual([
      { etiqueta: "Pedidos", valor: 200, conversion: null, proporcion: 1 },
      { etiqueta: "Albaranes", valor: 0, conversion: 0, proporcion: 0 },
      { etiqueta: "Facturas", valor: 50, conversion: null, proporcion: 0.25 },
    ]);
  });
});

describe("dashboard: pregunta a la IA", () => {
  test("tipos que pueden pintar la misma consulta", () => {
    const base = { recurso: "ventas.factura", metricas: "suma:total" };
    expect(alternativasTipo(base)).toEqual(["tarjeta"]);
    expect(alternativasTipo({ ...base, agrupar: "fecha:mes" })).toEqual(["temporal"]);
    expect(alternativasTipo({ ...base, agrupar: "provincia" })).toEqual(["mapa", "ranking", "barras"]);
    expect(alternativasTipo({ ...base, agrupar: "cliente" })).toEqual(["ranking", "barras", "circular"]);
    expect(alternativasTipo({ recurso: "ventas.factura", columnas: "factura" })).toEqual(["tabla"]);
  });

  test("el componente ocupa el sitio del que se creaba, con el tamaño del tipo", () => {
    const base = componente({ id: "c3", tipo: "pregunta_ia", x: 6, y: 8, w: 6, h: 8, consultas: [] });
    const resultado = componenteDesdePropuesta(
      base,
      {
        tipo: "tabla",
        titulo: "Pendientes",
        consulta: { recurso: "ventas.pedido", columnas: "pedido,total" },
        explicacion: "",
      },
      "pedidos pendientes"
    );
    expect(resultado).toMatchObject({ id: "c3", tipo: "tabla", x: 0, y: 8, w: 12, h: 8 });
    expect(resultado.opciones).toEqual({ pregunta: "pedidos pendientes" });
    expect(cambiarTipo(resultado, "tarjeta")).toMatchObject({ tipo: "tarjeta", w: 3, h: 2 });
  });
});

describe("componentesDesdePropuestaDashboard", () => {
  const propuesta = (tipo: ComponenteDashboard["tipo"], titulo: string) => ({
    tipo,
    titulo,
    consulta: { recurso: "ventas.factura", metricas: "suma:total" },
    explicacion: "",
  });

  test("tarjetas en la primera fila y gráficos debajo, sin solaparse", () => {
    const componentes = componentesDesdePropuestaDashboard({
      nombre: "Ventas",
      componentes: [
        propuesta("tarjeta", "A"),
        propuesta("tarjeta", "B"),
        propuesta("tarjeta", "C"),
        propuesta("temporal", "Evolución"),
        propuesta("circular", "Reparto"),
        propuesta("tabla", "Pendientes"),
      ],
    });

    expect(componentes.map(({ id, x, y, w, h }) => ({ id, x, y, w, h }))).toEqual([
      { id: "c1", x: 0, y: 0, w: 3, h: 2 },
      { id: "c2", x: 3, y: 0, w: 3, h: 2 },
      { id: "c3", x: 6, y: 0, w: 3, h: 2 },
      { id: "c4", x: 0, y: 2, w: 8, h: 8 },
      { id: "c5", x: 8, y: 2, w: 4, h: 8 },
      { id: "c6", x: 0, y: 10, w: 12, h: 8 },
    ]);
    expect(componentes[3]).toMatchObject({
      tipo: "temporal",
      titulo: "Evolución",
      consultas: [{ recurso: "ventas.factura", metricas: "suma:total" }],
      opciones: {},
    });
  });
});
