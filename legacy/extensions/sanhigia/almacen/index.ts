import ventas from "@quimera-extension/base-ventas";
import core from "@quimera-extension/core";
import login from "@quimera-extension/login";

import AppMenu from "./static/appmenu";
import schemas from "./static/schemas";
import * as GenerarPreparaciones from "./views/GenerarPreparaciones";
import * as AgruparPedidos from "./views/GenerarPreparaciones/AgruparPedidos";
import * as PedidosFiltro from "./views/GenerarPreparaciones/PedidosFiltro";
import * as PedidosMaster from "./views/GenerarPreparaciones/PedidosMaster";
import * as InformeProductosaCaducar from "./views/InformeProductosaCaducar";
import * as Inventario from "./views/Inventario";
import * as LineasFiltro from "./views/Inventario/LineasFiltro";
import * as Inventarios from "./views/Inventarios";
import * as InventariosFiltro from "./views/Inventarios/InventariosFiltro";
import * as InventariosMaster from "./views/Inventarios/InventariosMaster";
import * as LineaInventario from "./views/LineaInventario";
import * as LineaPedidoCompra from "./views/LineaPedidoCompra";
import * as LineaPedidoVentaCli from "./views/LineaPedidoVentaCli";
import * as LineaPedidoVentaCliShPreparacion from "./views/LineaPedidoVentaCliShPreparacion";
import * as LotesPorAlmacen from "./views/LotesPorAlmacen";
import * as MoviLotesCli from "./views/MoviLotesCli";
import * as MoviLotesProv from "./views/MoviLotesProv";
import * as PedidoCompra from "./views/PedidoCompra";
import * as PedidoCompraAgrupado from "./views/PedidoCompraAgrupado";
import * as PedidoGenerarPreparaciones from "./views/PedidoGenerarPreparaciones";
import * as EnviarAPda from "./views/PedidoGenerarPreparaciones/EnviarAPda";
import * as PedidosDeCompra from "./views/PedidosDeCompra";
import * as PedidosCompraFiltro from "./views/PedidosDeCompra/PedidosCompraFiltro";
import * as PedidosCompraMaster from "./views/PedidosDeCompra/PedidosCompraMaster";
import * as ShPreparacionDePedido from "./views/ShPreparacionDePedido";
import * as ShPreparacionDePedidos from "./views/ShPreparacionDePedidos";
import * as ShPreparacionDePedidosMaster from "./views/ShPreparacionDePedidos/ShPreparacionDePedidosMaster";
import * as ShPreparacionFiltro from "./views/ShPreparacionDePedidos/ShPreparacionFiltro";

export * from "./comps";

export default {
  path: "extensions/sanhigia/almacen",
  views: {
    Inventario,
    ShPreparacionDePedidos,
    ShPreparacionDePedido,
    LineaPedidoVentaCli,
    LineaPedidoVentaCliShPreparacion,
    LotesPorAlmacen,
    GenerarPreparaciones,
    PedidoGenerarPreparaciones,
    MoviLotesCli,
    LineaInventario,
    PedidosDeCompra,
    PedidoCompra,
    LineaPedidoCompra,
    MoviLotesProv,
    PedidoCompraAgrupado,
    Inventarios,
    InformeProductosaCaducar
  },
  subviews: {
    ShPreparacionDePedidosMaster,
    "ShPreparacionDePedidos/ShPreparacionFiltro": ShPreparacionFiltro,
    "Inventarios/InventariosMaster": InventariosMaster,
    "Inventarios/InventariosFiltro": InventariosFiltro,
    "Inventario/LineasFiltro": LineasFiltro,
    "GenerarPreparaciones/PedidosMaster": PedidosMaster,
    "GenerarPreparaciones/PedidosFiltro": PedidosFiltro,
    "GenerarPreparaciones/AgruparPedidos": AgruparPedidos,
    "PedidoGenerarPreparaciones/EnviarAPda": EnviarAPda,
    "PedidosDeCompra/PedidosCompraMaster": PedidosCompraMaster,
    "PedidosDeCompra/PedidosCompraFiltro": PedidosCompraFiltro,
  },
  routes: {
    "/sh_preparaciondepedidos": { type: "view", view: "ShPreparacionDePedidos" },
    "/sh_preparaciondepedidos/:codPreparacionDePedido": {
      type: "view",
      view: "ShPreparacionDePedidos",
    },
    "/generarpreparaciones": { type: "view", view: "GenerarPreparaciones" },
    "/generarpreparaciones/:idPedido": { type: "view", view: "GenerarPreparaciones" },
    "/generarpreparaciones/:idPedido/movilotes/:idLineaPC": { type: "view", view: "MoviLotesCli" },
    "/sh_preparaciondepedidos/:codPreparacionDePedido/movilotes/:idLineaPC": {
      type: "view",
      view: "MoviLotesCli",
    },
    "/pedidosdecompra": { type: "view", view: "PedidosDeCompra" },
    "/pedidosdecompra/:idPedido": { type: "view", view: "PedidosDeCompra" },
    "/pedidoscompra/agrupar/:idsPedido": { type: "view", view: "PedidoCompraAgrupado" },
    "/pedidosdecompra/:idPedido/movilotes/:idLineaPP": { type: "view", view: "MoviLotesProv" },
    "/informes/productosacaducar": { type: "view", view: "InformeProductosaCaducar" },
  },
  dependencies: [core, login, ventas],
  menus: {
    app: AppMenu,
  },
  rules: {
    'almacen.preparacion_salida': (check: (rule: string) => boolean) => check('almacen.preparacion_salida'),
  },
  schemas,
};
