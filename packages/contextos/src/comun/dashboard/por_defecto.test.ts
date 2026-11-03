import { COLUMNAS_REJILLA, compactar } from "@olula/componentes/rejilla/dominio.ts";
import { componentesVisibles, dashboardPorDefecto, problemaComponente } from "./dominio.ts";
import { CLAVES_MODULO, DASHBOARDS_POR_DEFECTO } from "./por_defecto.ts";

describe("dashboards por defecto", () => {
  test("hay Inicio y uno por módulo del menú", () => {
    expect(Object.keys(DASHBOARDS_POR_DEFECTO).sort()).toEqual(
      ["inicio", ...CLAVES_MODULO].sort()
    );
  });

  Object.entries(DASHBOARDS_POR_DEFECTO).forEach(([clave, { componentes }]) => {
    test(`${clave}: componentes completos, sin ids repetidos ni solapes`, () => {
      componentes.forEach((c) => expect([c.id, problemaComponente(c)]).toEqual([c.id, null]));
      const ids = componentes.map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length);
      componentes.forEach((c) => expect(c.x + c.w).toBeLessThanOrEqual(COLUMNAS_REJILLA));
      // Ya colocados: compactar no mueve nada (ni solapes ni huecos que rellenar).
      expect(compactar(componentes)).toEqual(componentes);
    });
  });

  test("solo muestra lo que el usuario puede ver", () => {
    const inicio = DASHBOARDS_POR_DEFECTO.inicio;
    const soloVentas = componentesVisibles(inicio.componentes, ["ventas.factura", "ventas.pedido"]);
    expect(soloVentas.map((c) => c.id)).toEqual([
      "facturado_mes",
      "pedidos_pendientes",
      "evolucion",
      "pedidos_estado",
      "top_clientes",
      "mapa_ventas",
    ]);
    const texto = { ...inicio.componentes[0], id: "nota", tipo: "texto" as const, consultas: [] };
    expect(componentesVisibles([texto], [])).toEqual([texto]);
  });

  test("sin versión del usuario: el de código, sin id y propio (se puede personalizar)", () => {
    const dashboard = dashboardPorDefecto("ventas", DASHBOARDS_POR_DEFECTO.ventas, []);
    expect(dashboard).toMatchObject({ id: "", clave: "ventas", nombre: "Ventas", esPropio: true });
    expect(dashboard.componentes).toEqual([]);
  });
});
