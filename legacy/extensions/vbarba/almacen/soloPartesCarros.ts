// Dependencia para las apps que cargan vbarba-almacen solo por los partes de
// carros (barnaplant, cash): se pone DESPUÉS de vbarba-almacen en el proyecto y
// deja en el menú de escritorio "Almacén" únicamente "Partes de carros".
// Las rutas de stocks, artículos y cambiar finca siguen existiendo; solo se
// quitan del menú.
type Menu = Record<string, { items?: Record<string, unknown> } & Record<string, unknown>>;

const menuSoloPartesCarros = (parent: Menu): Menu => {
  const inventarios = parent?.inventarios;
  if (!inventarios?.items) {
    return parent;
  }
  const { partesCarros } = inventarios.items;
  return {
    ...parent,
    inventarios: {
      ...inventarios,
      items: partesCarros ? { partesCarros } : {},
    },
  };
};

export default {
  path: "extensions/vbarba/almacen/solo-partes-carros",
  // El router del shell (router_legacy.ts) recorre dependencies en todas.
  dependencies: [],
  views: {},
  subviews: {},
  routes: {},
  rules: {},
  menus: {
    app: menuSoloPartesCarros,
  },
};
