import core from "@quimera-extension/core";
import login from "@quimera-extension/login";

import AppMenu from "./static/appmenu";
import schemas from "./static/schemas";
import * as LineaPedidoCli from "./views/LineaPedidoCli";
import * as LineaPedidoCliNueva from "./views/LineaPedidoCliNueva";
import * as LineaPresupuestoCli from "./views/LineaPresupuestoCli";
import * as LineaPresupuestoCliNueva from "./views/LineaPresupuestoCliNueva";
import * as PedidoCli from "./views/PedidoCli";
import * as PedidosCli from "./views/PedidosCli";
import * as PedidoDirCliente from "./views/PedidosCli/DirCliente";
import * as PedidoDetalle from "./views/PedidosCli/PedidoDetalle";
import * as PedidosFiltro from "./views/PedidosCli/PedidosFiltro";
import * as PedidosMaster from "./views/PedidosCli/PedidosMaster";
import * as PedidosCliNuevo from "./views/PedidosCliNuevo";
import * as PresupuestoCli from "./views/PresupuestoCli";
import * as PresupuestoCliNuevo from "./views/PresupuestoCliNuevo";
import * as PresupuestosCli from "./views/PresupuestosCli";
import * as PresupuestosCliFilter from "./views/PresupuestosCli/Filter";
import * as PresupuestosCliMaster from "./views/PresupuestosCli/Master";

export * from "./comps";

export default {
  path: "extensions/base/ventas",
  views: {
    LineaPedidoCli,
    LineaPedidoCliNueva,
    LineaPresupuestoCli,
    LineaPresupuestoCliNueva,
    PedidoCli,
    PedidosCli,
    PedidosCliNuevo,
    PresupuestoCli,
    PresupuestoCliNuevo,
    PresupuestosCli,
  },
  subviews: {
    "PedidosCli/DirCliente": PedidoDirCliente,
    "PedidosCli/PedidosMaster": PedidosMaster,
    "PedidosCli/PedidosFiltro": PedidosFiltro,
    "PedidosCli/PedidoDetalle": PedidoDetalle,
    "PresupuestosCli/Master": PresupuestosCliMaster,
    "PresupuestosCli/Filter": PresupuestosCliFilter,
  },
  routes: {
    "/ventas": { type: "view", view: "VentasHome" },
    "/ventas/pedidos": { type: "view", view: "PedidosCli" },
    "/ventas/pedidos/:idPedido": { type: "view", view: "PedidosCli" },
    "/ventas/presupuestos": { type: "view", view: "PresupuestosCli" },
    "/ventas/presupuestos/:idPresupuesto": { type: "view", view: "PresupuestosCli" },
  },
  dependencies: [core, login],
  schemas,
  menus: {
    app: AppMenu,
  },
  rules: {
    "PedidosCli:visit": (check: (rule: string) => boolean) => check("ventas.pedido"),
  },
};
