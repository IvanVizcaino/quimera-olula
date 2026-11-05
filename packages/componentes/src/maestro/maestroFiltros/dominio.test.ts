import { ClausulaFiltro } from "@olula/lib/diseño.ts";
import { describe, expect, test } from "vitest";
import { camelASnake, chipsFiltro, describirValorFiltro, ordenarCamposPanel } from "./dominio.ts";
import { getMetaFiltroDefecto, type MetaFiltro } from "./MaestroFiltrosActivoControlado.tsx";

const nulo = () => null;

const meta: MetaFiltro = {
  codigo: { id: "codigo", label: "Código", tipo: "texto", filtro: nulo },
  fecha: { id: "fecha", label: "Fecha", tipo: "intervalo_fechas", filtro: nulo },
  total: { id: "total", label: "Total", tipo: "intervalo_numeros", filtro: nulo },
  estado: {
    id: "estado",
    label: "Estado",
    tipo: "multiseleccion",
    opciones: [
      { valor: "P", descripcion: "Pendiente" },
      { valor: "E", descripcion: "Emitida" },
    ],
    filtro: nulo,
  },
  abono: { id: "abono", label: "De abono", tipo: "checkbox", filtro: nulo },
};

describe("describirValorFiltro", () => {
  test("atajos y rangos de fecha", () => {
    expect(describirValorFiltro(meta.fecha, "@este-año")).toBe("Este año");
    expect(describirValorFiltro(meta.fecha, [new Date(2026, 0, 1), new Date(2026, 0, 31)]))
      .toBe("1/1/2026 – 31/1/2026");
    expect(describirValorFiltro(meta.fecha, [new Date(2026, 0, 1), undefined])).toBe("≥ 1/1/2026");
  });

  test("intervalos de números con el operador que toca", () => {
    expect(describirValorFiltro(meta.total, [10000, undefined])).toBe("≥ 10.000");
    expect(describirValorFiltro(meta.total, [undefined, 500])).toBe("≤ 500");
    expect(describirValorFiltro(meta.total, [100, 500])).toBe("100 – 500");
    expect(describirValorFiltro(meta.total, [NaN, NaN])).toBeNull();
  });

  test("multiselección con las descripciones de las opciones", () => {
    expect(describirValorFiltro(meta.estado, ["P", "E"])).toBe("Pendiente, Emitida");
    expect(describirValorFiltro(meta.estado, [])).toBeNull();
  });

  test("booleanos, texto, vacíos y describir propio", () => {
    expect(describirValorFiltro(meta.abono, "true")).toBe("Sí");
    expect(describirValorFiltro(meta.codigo, "F025")).toBe("F025");
    expect(describirValorFiltro(meta.codigo, "")).toBeNull();
    expect(describirValorFiltro({ ...meta.codigo, describir: (v) => `#${v}` }, "7")).toBe("#7");
  });
});

describe("chipsFiltro", () => {
  test("un chip por campo con valor; los del filtro inicial no se quitan", () => {
    const filtro: ClausulaFiltro[] = [
      ["fecha", "=", "@este-año"],
      ["codigo", "~", "F025"],
    ];
    const chips = chipsFiltro(filtro, [["fecha", "=", "@este-año"]], meta, {
      fecha: "@este-año",
      codigo: "F025",
    });
    expect(chips).toEqual([
      { id: "codigo", etiqueta: "Código", texto: "F025", quitable: true },
      { id: "fecha", etiqueta: "Fecha", texto: "Este año", quitable: false },
    ]);
  });

  test("sin cláusula no hay chip aunque el valor tenga defecto", () => {
    expect(chipsFiltro([], [], meta, { codigo: "x" })).toEqual([]);
  });
});

test("ordenarCamposPanel pone las fechas primero", () => {
  expect(ordenarCamposPanel(meta).map((c) => c.id)).toEqual([
    "fecha", "codigo", "total", "estado", "abono",
  ]);
});

test("getMetaFiltroDefecto con campoApi filtra por el nombre de la API", () => {
  const meta = getMetaFiltroDefecto(
    [
      { id: "nombreProveedor", cabecera: "Proveedor" },
      { id: "total", cabecera: "Total", tipo: "moneda" },
    ],
    { campoApi: camelASnake }
  );
  expect(meta.nombreProveedor.campo).toBe("nombre_proveedor");
  expect(meta.nombreProveedor.filtro("SUMI")).toEqual(["nombre_proveedor", "~", "SUMI"]);
  expect(meta.total.filtro([100, undefined])).toEqual(["total", ">=", "100_"]);
  expect(camelASnake("deAbono")).toBe("de_abono");
});
