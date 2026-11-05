import { DefinicionWidget } from "./diseño.ts";
import {
  agrupacionWidget,
  agruparPorFiltro,
  dimensionesAgrupables,
  esAgrupado,
  puntosWidget,
  configDesdeRecurso,
  recursoParaRuta,
  aliasWidget,
  filtroWidget,
  formatearValorWidget,
  metricaWidget,
  nuevoWidget,
  pieWidget,
} from "./dominio.ts";

const total: DefinicionWidget = {
  id: "total",
  titulo: "Total",
  operacion: "suma",
  campo: "total",
  formato: "moneda",
};
const recuento: DefinicionWidget = {
  id: "n",
  titulo: "Facturas",
  operacion: "conteo",
  formato: "numero",
};
const pendientes: DefinicionWidget = {
  ...recuento,
  id: "pendientes",
  filtro: [["estado", "=", "pendiente"]],
};

describe("widgets del maestro", () => {
  test("métrica y alias coinciden con el servidor", () => {
    expect(metricaWidget(total)).toBe("suma:total");
    expect(aliasWidget(total)).toBe("suma_total");
    expect(metricaWidget(recuento)).toBe("conteo");
    expect(aliasWidget(recuento)).toBe("conteo");
  });

  test("el filtro del widget se suma al del listado", () => {
    expect(filtroWidget([["fecha", ">=", "2026-01-01"]], pendientes)).toEqual([
      ["fecha", ">=", "2026-01-01"],
      ["estado", "=", "pendiente"],
    ]);
    expect(filtroWidget(undefined, total)).toEqual([]);
    expect(filtroWidget({ or: [] }, pendientes)).toEqual({
      and: [{ or: [] }, ["estado", "=", "pendiente"]],
    });
  });

  test("una petición por filtro distinto", () => {
    expect(agruparPorFiltro([total, recuento, pendientes])).toEqual([
      [total, recuento],
      [pendientes],
    ]);
  });

  test("formato y pie", () => {
    expect(formatearValorWidget(null, total)).toBe("—");
    expect(formatearValorWidget(1234.5, recuento)).toBe("1234,5");
    expect(pieWidget(total)).toBe("Suma de total");
    expect(pieWidget({ ...total, pie: "Suma del total" })).toBe(
      "Suma del total"
    );
  });

  test("el pie usa la etiqueta del campo", () => {
    expect(
      pieWidget(total, [
        { id: "total", etiqueta: "Base imponible", formato: "moneda" },
      ])
    ).toBe("Suma de base imponible");
    expect(
      pieWidget({ ...total, campo: "total_iva" }, [
        { id: "total_iva", etiqueta: "IVA", formato: "moneda" },
      ])
    ).toBe("Suma de IVA");
  });

  test("nuevo widget: id único y formato del campo", () => {
    const neto = { id: "neto", etiqueta: "Base", formato: "moneda" as const };
    const primero = nuevoWidget(" Base ", "suma", neto, []);
    expect(primero).toEqual({
      id: "suma_neto",
      titulo: "Base",
      operacion: "suma",
      campo: "neto",
      formato: "moneda",
    });
    expect(nuevoWidget("Otra", "suma", neto, [primero]).id).toBe("suma_neto_2");
    expect(nuevoWidget("N", "conteo", neto, [])).toEqual({
      id: "conteo_neto",
      titulo: "N",
      operacion: "conteo",
      formato: "numero",
    });
  });

  test("recurso de la pantalla: el homónimo de la ruta, nunca el de líneas", () => {
    const recursos = [
      {
        id: "ventas.factura.linea",
        descripcion: "",
        ruta: "/ventas/factura",
        medidas: [],
      },
      {
        id: "tesoreria.pago_cobro",
        descripcion: "",
        ruta: "/ventas/factura",
        medidas: [],
      },
      {
        id: "ventas.factura",
        descripcion: "",
        ruta: "/ventas/factura",
        medidas: [],
      },
      {
        id: "crm.oportunidad_venta",
        descripcion: "",
        ruta: "/crm/oportunidadventa",
        medidas: [],
      },
    ];
    expect(recursoParaRuta(recursos, "/ventas/factura")?.id).toBe(
      "ventas.factura"
    );
    expect(recursoParaRuta(recursos, "/ventas/factura/123")?.id).toBe(
      "ventas.factura"
    );
    expect(recursoParaRuta(recursos, "/crm/oportunidadventa")?.id).toBe(
      "crm.oportunidad_venta"
    );
    expect(recursoParaRuta(recursos, "/ventas/facturacion")).toBeUndefined();
    expect(recursoParaRuta(recursos, "/crm/cliente")).toBeUndefined();
  });

  test("configuración automática: sin widgets y con las medidas del servidor", () => {
    const config = configDesdeRecurso({
      id: "almacen.stock",
      descripcion: "Stock por artículo y almacén (una fila por stock).",
      ruta: "/almacen/stock",
      medidas: [
        { id: "cantidad", descripcion: "unidades en stock" },
        { id: "importe_total", descripcion: "valor del stock" },
      ],
    });
    expect(config).toEqual({
      recurso: "almacen.stock",
      titulo: "Stock por artículo y almacén",
      widgets: [],
      campos: [
        { id: "cantidad", etiqueta: "Unidades en stock", formato: "numero" },
        { id: "importe_total", etiqueta: "Valor del stock", formato: "moneda" },
      ],
    });
  });
});

describe("widgets compactos", () => {
  const base: DefinicionWidget = {
    id: "w",
    titulo: "Ventas",
    operacion: "suma",
    campo: "total",
    formato: "moneda",
  };

  test("solo los temporales, circulares y rankings con dimensión agrupan", () => {
    expect(esAgrupado(base)).toBe(false);
    expect(esAgrupado({ ...base, tipo: "objetivo", meta: 10 })).toBe(false);
    expect(esAgrupado({ ...base, tipo: "temporal", agrupar: "fecha" })).toBe(true);
    expect(esAgrupado({ ...base, tipo: "ranking" })).toBe(false);
  });

  test("parámetros de agrupación de cada tipo", () => {
    const temporal = new URLSearchParams(
      agrupacionWidget({ ...base, tipo: "temporal", agrupar: "fecha" })
    );
    expect(Object.fromEntries(temporal)).toEqual({
      agrupar: "fecha:mes",
      orden: "fecha:desc",
      limite: "12",
    });
    const ranking = new URLSearchParams(
      agrupacionWidget({ ...base, tipo: "ranking", agrupar: "cliente" })
    );
    expect(Object.fromEntries(ranking)).toEqual({
      agrupar: "cliente",
      orden: "suma_total:desc",
      limite: "3",
    });
  });

  test("puntos: el temporal en orden cronológico; las categorías con su nombre", () => {
    expect(
      puntosWidget({ ...base, tipo: "temporal", agrupar: "fecha" }, [
        { fecha: "2026-10-01", suma_total: 3 },
        { fecha: "2026-09-01", suma_total: 2 },
      ])
    ).toEqual([
      { clave: "2026-09-01", etiqueta: "sep 26", valor: 2 },
      { clave: "2026-10-01", etiqueta: "oct 26", valor: 3 },
    ]);
    // Meses seguidos: los vacíos a 0 y como mucho 12, acabando en el último con datos.
    const temporal = puntosWidget({ ...base, tipo: "temporal", agrupar: "fecha" }, [
      { fecha: "2026-09-01", suma_total: 5 },
      { fecha: "2026-06-01", suma_total: 4 },
      { fecha: "2026-02-01", suma_total: 3 },
      { fecha: "2025-08-01", suma_total: 1 },
    ]);
    expect(temporal.map((p) => p.etiqueta)).toEqual([
      "oct 25", "nov 25", "dic 25", "ene 26", "feb 26", "mar 26",
      "abr 26", "may 26", "jun 26", "jul 26", "ago 26", "sep 26",
    ]);
    expect(temporal.map((p) => p.valor)).toEqual([0, 0, 0, 0, 3, 0, 0, 0, 4, 0, 0, 5]);
    expect(temporal[0].clave).toBe("2025-10-01");
    expect(
      puntosWidget({ ...base, tipo: "ranking", agrupar: "cliente" }, [
        { cliente: "C1", cliente_nombre: "Cliente Uno", suma_total: 9 },
        { cliente: null, suma_total: 1 },
      ]).map((p) => p.etiqueta)
    ).toEqual(["Cliente Uno", "Sin valor"]);
  });
});

test("dimensiones agrupables: sin ids, sin el código del documento, útiles primero", () => {
  const dimension = (id: string, tipo = "texto") => ({ id, descripcion: id, tipo });
  expect(
    dimensionesAgrupables(
      [
        dimension("factura"),
        dimension("factura_id", "numero"),
        dimension("cliente"),
        dimension("nombre_cliente"),
        dimension("serie"),
        dimension("agente"),
        dimension("fecha", "fecha"),
        dimension("de_abono", "booleano"),
      ],
      "ventas.factura"
    ).map((d) => d.id)
  ).toEqual(["agente", "cliente", "serie", "de_abono"]);
});
