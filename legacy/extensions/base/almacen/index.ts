export * from './comps'
import AppMenu from './static/appmenu'
import schemas from './static/schemas'

import * as Inventario from './views/Inventario'
import * as Inventarios from './views/Inventarios'
import * as LineaInventario from './views/LineaInventario'
import * as LineaInventarioNueva from './views/LineaInventarioNueva'

import core from "@quimera-extension/core"
import login from "@quimera-extension/login"
import * as InventariosMaster from './views/Inventarios/InventariosMaster'

export default {
  path: 'extensions/base/almacen',
  schemas,
  menus: {
    app: AppMenu,
  },
  views: {
    Inventario,
    Inventarios,
    LineaInventario,
    LineaInventarioNueva
  },
  subviews: {
    'Inventarios/InventariosMaster': InventariosMaster
  },
  routes: {
    '/almacen/inventarios': { type: 'view', view: 'Inventarios' },
    '/almacen/inventarios/:codInventario': { type: 'view', view: 'Inventarios' }
  },
  dependencies: [core, login],
  rules: {
    'Inventarios:visit': (check: (rule: string) => boolean) => check('almacen.inventario'),
  },
}

// export default {
//   path: 'extensions/base/ventas',
//   views: {
//     // VentasHome,
//     // DirCliente,
//     Presupuestos,
//     PedidosCli,
//     PedidosCliNuevo,
//     LineaPedidoCli,
//     LineaPedidoCliNueva
//   },
//   subviews: {
//     // Master,
//     // Detalle,
//     'PedidosCli/DirCliente': PedidoDirCliente,
//     'PedidosCli/PedidosMaster': PedidosMaster,
//     'PedidosCli/PedidoDetalle': PedidoDetalle
//   },
//   routes: {
//     '/ventas': { type: 'view', view: 'VentasHome' },
//     '/ventas/presupuestos': { type: 'view', view: 'Presupuestos' },
//     '/ventas/pedidos': { type: 'view', view: 'PedidosCli' },
//     //'/ventas/pedidos/nuevo': { type: 'view', view: 'PedidosCliNuevo' },
//     '/ventas/pedidos/:idPedido': { type: 'view', view: 'PedidosCli' },
//   },
//   dependencies: [
//     core,
//     login
//   ],
//   schemas,
//   menus: {
//     app: AppMenu,
//   },
// }