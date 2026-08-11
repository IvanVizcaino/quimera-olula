import areaClientes from "@quimera-extension/base-area_clientes";
import tiendaNativa from "@quimera-extension/base-tienda_nativa";
import core from "@quimera-extension/core";

import * as ItemCatalogo from "./comps/ItemCatalogo";
import * as ItemLineaCarritoCheckout from "./comps/ItemLineaCarritoCheckout";
import AppMenu from "./static/appmenu";
import schemas from "./static/schemas";
import { translations } from "./static/translations";
import * as Catalogo from "./views/Catalogo";
import * as CatalogoMaster from "./views/Catalogo/CatalogoMaster";
import * as Checkout from "./views/Checkout";
import * as DatosCliente from "./views/Checkout/DatosCliente";
import * as ConfiguracionSofa from "./views/ConfiguracionSofa";
import * as Configuraciones from "./views/ConfiguracionSofa/Configuraciones";
import * as Montador from "./views/ConfiguracionSofa/Montador";
import * as Container from "./views/Container";
import * as DocumentosClientes from "./views/DocumentosClientes";
import * as ListaDocumentos from "./views/DocumentosClientes/ListaDocumentos";
import * as Global from "./views/Global";
import * as Header from "./views/Header";
import * as HeaderCarrito from "./views/Header/Carrito";
import * as Home from "./views/Home";
import * as MiFactura from "./views/MiFactura";
import * as MiPedido from "./views/MiPedido";
import * as MisPedidos from "./views/MisPedidos";
import * as MisPedidosFiltro from "./views/MisPedidos/MisPedidosFiltro";
import * as PedidosMaster from "./views/MisPedidos/MisPedidosMaster";
import * as Reparacion from "./views/Reparacion";
import * as Reparaciones from "./views/Reparaciones";
import * as FilterReparaciones from "./views/Reparaciones/FilterReparaciones";
import * as MasterReparaciones from "./views/Reparaciones/MasterReparaciones";


export default {
  path: "extensions/area_clientes",
  views: {
    Container,
    Global,
    Header,
    Home,
    ConfiguracionSofa,
    Catalogo,
    Checkout,
    DocumentosClientes,
    MiPedido,
    MiFactura,
    MisPedidos,
    Reparaciones,
    Reparacion,
  },
  subviews: {
    "Catalogo/CatalogoMaster": CatalogoMaster,
    "Checkout/DatosCliente": DatosCliente,
    "DocumentosClientes/ListaDocumentos": ListaDocumentos,
    ItemCatalogo,
    ItemLineaCarritoCheckout,
    "ConfiguracionSofa/Configuraciones": Configuraciones,
    "ConfiguracionSofa/Montador": Montador,
    "Header/Carrito": HeaderCarrito,
    PedidosMaster,
    "MisPedidos/MisPedidosFiltro": MisPedidosFiltro,
    "Reparaciones/FilterReparaciones": FilterReparaciones,
    "Reparaciones/MasterReparaciones": MasterReparaciones,
  },
  routes: {
    "/": { type: "view", view: "Home" },
    "/catalogo": { type: "view", view: "Catalogo" },
    "/areaclientes/tarifas": { type: "view", view: "DocumentosClientes" },
    "/modelos/:idModeloProp": { type: "view", view: "Catalogo" },
    "/areaclientes/reparaciones": { type: "view", view: "Reparaciones" },
    "/areaclientes/reparaciones/:idReparacion": { type: "view", view: "Reparaciones" },
  },
  dependencies: [core, tiendaNativa, areaClientes],
  menus: {
    app: AppMenu,
  },
  rules: {
    "AreaClientes:visit": true,
  },
  schemas,
  translations,
};
