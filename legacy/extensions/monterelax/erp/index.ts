import core from "@quimera-extension/core";

import * as ColaCosido from "./views/ColaCosido";
import * as ColaMontado from "./views/ColaMontado";
import * as CosidoInterno from "./views/CosidoInterno";
import * as DashboardCobros from "./views/DashboardCobros";
import * as DashboardCosido from "./views/DashboardCosido";
import * as DashboardEsqueletos from "./views/DashboardEsqueletos";
import * as DashboardGerenciaMrelax from "./views/DashboardGerenciaMrelax";
import * as DashboardRepresentantesMrelax from "./views/DashboardRepresentantesMrelax";
import * as DashboardStocks from "./views/DashboardStocks";
import * as DashboardTesoreria from "./views/DashboardTesoreria";
import * as DocumentosRepresentantes from "./views/DocumentosRepresentantes";
import * as Footer from "./views/Footer";
import * as Home from "./views/Home";
import * as MisPedidos from "./views/MisPedidos";
import * as MisReparaciones from "./views/MisReparaciones";
import * as MontadoInterno from "./views/MontadoInterno";
import * as OrdenDeCargaDetalle from "./views/OrdenDeCargaDetalle";
import * as OrdenesCarga from "./views/OrdenesCarga";
import * as PedidosCliente from "./views/PedidosCliente";
import * as RecepcionCosido from "./views/RecepcionCosido";

import * as CosidoInternoDetalle from "./views/CosidoInterno/CosidoInternoDetalle";
import * as CosidoInternoMaster from "./views/CosidoInterno/CosidoInternoMaster";
import * as DashboardFiltroCobros from "./views/DashboardCobros/DashboardFiltro";
import * as GraficosCobros from "./views/DashboardCobros/GraficosCobros";
import * as FiltroDashboardCosido from "./views/DashboardCosido/FiltroDashboardCosido";
import * as GraficosCosido from "./views/DashboardCosido/GraficosCosido";
import * as DashboardFiltroGerencia from "./views/DashboardGerenciaMrelax/DashboardFiltro";
import * as GraficosGerencia from "./views/DashboardGerenciaMrelax/GraficosGerencia";
import * as TotalesGerencia from "./views/DashboardGerenciaMrelax/Totales";
import * as DashboardFiltroRepresentantes from "./views/DashboardRepresentantesMrelax/DashboardFiltro";
import * as GraficosRepresentantes from "./views/DashboardRepresentantesMrelax/GraficosRepresentantes";
import * as StocksFiltro from "./views/DashboardStocks/FiltroMaster";
import * as StocksCheckout from "./views/DashboardStocks/StocksCheckout";
import * as StocksDetalle from "./views/DashboardStocks/StocksDetalle";
import * as StocksMaster from "./views/DashboardStocks/StocksMaster";
import * as DashboardFiltroTesoreria from "./views/DashboardTesoreria/DashboardFiltro";
import * as TesoreriaDetalle from "./views/DashboardTesoreria/TesoreriaDetalle";
import * as TesoreriaMaster from "./views/DashboardTesoreria/TesoreriaMaster";
import * as ListaDocumentos from "./views/DocumentosRepresentantes/ListaDocumentos";
import * as MisPedidosFiltro from "./views/MisPedidos/FiltroMaster";
import * as MisPedidosDetalle from "./views/MisPedidos/MisPedidosDetalle";
import * as MisPedidosMaster from "./views/MisPedidos/MisPedidosMaster";
import * as MisReparacionesFiltro from "./views/MisReparaciones/FiltroMaster";
import * as MisReparacionesMaster from "./views/MisReparaciones/MisReparacionesMaster";
import * as MontadoInternoDetalle from "./views/MontadoInterno/MontadoInternoDetalle";
import * as MontadoInternoMaster from "./views/MontadoInterno/MontadoInternoMaster";
import * as PedidosFiltro from "./views/PedidosCliente/FiltroMaster";
import * as PedidosDetalle from "./views/PedidosCliente/PedidosDetalle";
import * as PedidosMaster from "./views/PedidosCliente/PedidosMaster";

import AppMenu from "./static/appmenu";
import schemas from "./static/schemas";

type CheckFn = (rule: string) => boolean;

export default {
  path: "extensions/monterelax/erp",
  views: {
    Home,
    Footer,
    DashboardCobros,
    DashboardCosido,
    DashboardEsqueletos,
    DashboardGerenciaMrelax,
    DashboardRepresentantesMrelax,
    DashboardStocks,
    ColaMontado,
    OrdenesCarga,
    OrdenDeCargaDetalle,
    PedidosCliente,
    ColaCosido,
    RecepcionCosido,
    DocumentosRepresentantes,
    DashboardTesoreria,
    MisPedidos,
    MisReparaciones,
    MontadoInterno,
    CosidoInterno,
  },
  subviews: {
    "DashboardCosido/FiltroDashboardCosido": FiltroDashboardCosido,
    "DashboardCosido/GraficosCosido": GraficosCosido,
    "DashboardGerenciaMrelax/DashboardFiltro": DashboardFiltroGerencia,
    "DashboardGerenciaMrelax/GraficosGerencia": GraficosGerencia,
    "DashboardGerenciaMrelax/Totales": TotalesGerencia,
    "DashboardRepresentantesMrelax/DashboardFiltro": DashboardFiltroRepresentantes,
    "DashboardRepresentantesMrelax/GraficosRepresentantes": GraficosRepresentantes,
    "DashboardCobros/DashboardFiltro": DashboardFiltroCobros,
    "DashboardCobros/GraficosCobros": GraficosCobros,
    "PedidosCliente/FiltroMaster": PedidosFiltro,
    "PedidosCliente/PedidosDetalle": PedidosDetalle,
    "PedidosCliente/PedidosMaster": PedidosMaster,
    "DocumentosRepresentantes/ListaDocumentos": ListaDocumentos,
    "DashboardStocks/StocksMaster": StocksMaster,
    "DashboardStocks/StocksDetalle": StocksDetalle,
    "DashboardStocks/StocksCheckout": StocksCheckout,
    "DashboardStocks/FiltroMaster": StocksFiltro,
    "DashboardTesoreria/DashboardFiltro": DashboardFiltroTesoreria,
    "DashboardTesoreria/TesoreriaMaster": TesoreriaMaster,
    "DashboardTesoreria/TesoreriaDetalle": TesoreriaDetalle,
    "MisPedidos/MisPedidosMaster": MisPedidosMaster,
    "MisPedidos/MisPedidosDetalle": MisPedidosDetalle,
    "MisPedidos/FiltroMaster": MisPedidosFiltro,
    "MisReparaciones/MisReparacionesMaster": MisReparacionesMaster,
    "MisReparaciones/FiltroMaster": MisReparacionesFiltro,
    "MontadoInterno/MontadoInternoMaster": MontadoInternoMaster,
    "MontadoInterno/MontadoInternoDetalle": MontadoInternoDetalle,
    "CosidoInterno/CosidoInternoMaster": CosidoInternoMaster,
    "CosidoInterno/CosidoInternoDetalle": CosidoInternoDetalle,
  },
  routes: {
    "/": { type: "view", view: "Home" },
    "/dashboardCobros": { type: "view", view: "DashboardCobros" },
    "/dashboardCosido": { type: "view", view: "DashboardCosido" },
    "/dashboardEsqueletos": { type: "view", view: "DashboardEsqueletos" },
    "/dashboardGerencia/:tipo": { type: "view", view: "DashboardGerenciaMrelax" },
    "/dashboardRepresentantes": { type: "view", view: "DashboardRepresentantesMrelax" },
    "/dashboardStocks": { type: "view", view: "DashboardStocks" },
    "/colaMontado": { type: "view", view: "ColaMontado" },
    "/ordenesDeCarga": { type: "view", view: "OrdenesCarga" },
    "/ordenDeCargaDetalle/:idOrdenDeCarga": { type: "view", view: "OrdenDeCargaDetalle" },
    "/pedidosCliente": { type: "view", view: "PedidosCliente" },
    "/colacosido": { type: "view", view: "ColaCosido" },
    "/recepcioncosido": { type: "view", view: "RecepcionCosido" },
    "/pedidosCliente/:idPedido": { type: "view", view: "PedidosCliente" },
    "/documentos": { type: "view", view: "DocumentosRepresentantes" },
    "/dashboardStocks/:idStock": { type: "view", view: "DashboardStocks" },
    "/dashboardTesoreria": { type: "view", view: "DashboardTesoreria" },
    "/mispedidos": { type: "view", view: "MisPedidos" },
    "/mispedidos/:idPedido": { type: "view", view: "MisPedidos" },
    "/misreparaciones": { type: "view", view: "MisReparaciones" },
    "/colaMontadoInterno": { type: "view", view: "MontadoInterno" },
    "/colaMontadoInterno/:idUnidad": { type: "view", view: "MontadoInterno" },
    "/colaCosidoInterno": { type: "view", view: "CosidoInterno" },
    "/colaCosidoInterno/:idUnidad": { type: "view", view: "CosidoInterno" },
  },
  rules: {
    "Menu:botones-gerencia": (check: CheckFn) => check("accesoglobal.gerencia"),
    "Menu:botones-produccion": (check: CheckFn) => check("accesoglobal.produccion"),
    "Menu:botones-dashboardcosido": (check: CheckFn) => check("accesoglobal.gerencia") || check("accesoglobal.produccion"),
    "Menu:botones-trabajador": (check: CheckFn) => check("accesoglobal.gerencia") || check("accesoglobal.produccion"),
    "Menu:botones-esqueletero": (check: CheckFn) => check("accesoglobal.gerencia") || check("accesoglobal.produccion"),
    "Menu:botones-recepcioncosido": (check: CheckFn) => check("accesoglobal.gerencia") || check("accesoglobal.produccion"),
    "Menu:botones-productosdisponibles": (check: CheckFn) => check("accesoglobal.gerencia") || check("accesoglobal.produccion") || check("accesoglobal.representantes"),
    "Menu:botones-cosido": (check: CheckFn) => check("accesoglobal.cosido"),
    "Menu:botones-montado": (check: CheckFn) => check("accesoglobal.montado"),
    "Menu:botones-cosido-interno": (check: CheckFn) => check("accesoglobal.cosidointerno"),
    "Menu:botones-montado-interno": (check: CheckFn) => check("accesoglobal.montadointerno"),
    "Menu:botones-agente": (check: CheckFn) => check("accesoglobal.representantes"),
  },
  dependencies: [core],
  menus: {
    app: AppMenu,
  },
  schemas
};
