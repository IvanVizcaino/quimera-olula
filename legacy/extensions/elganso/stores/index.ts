import core from "@quimera-extension/core";
import login from "@quimera-extension/login";

import AppMenu from "./static/appmenu";
import schemas from "./static/schemas";
import * as ConsultaStock from "./views/ConsultaStock";
import * as ControlHorario from "./views/ControlHorario";
import * as EditEnvio from "./views/EditEnvio";
import * as EditInventario from "./views/EditInventario";
import * as EditRecepcion from "./views/EditRecepcion";
import * as Envios from "./views/Envios";
import * as Home from "./views/Home";
import * as Inventarios from "./views/Inventarios";
import * as Login from "./views/Login";
import * as NewInventario from "./views/NewInventario";
import * as NewPedido from "./views/NewPedido";
import * as PedidosWeb from "./views/PedidosWeb";
import * as PlanificadorSemanal from "./views/PlanificadorSemanal";
import * as PlanificadorSemanalResumen from "./views/PlanificadorSemanalResumen";
import * as Recepciones from "./views/Recepciones";
import * as ResumenAgente from "./views/ResumenAgente";
import * as SelectorFecha from "./views/SelectorFecha";

const groupStorage = localStorage.getItem("user_data");
let group = "default";
if (groupStorage !== null) {
  group = JSON.parse(groupStorage).user.group;
}

export default {
  path: "extensions/elganso/stores",
  views: {
    Home,
    Login,
    Inventarios,
    NewInventario,
    EditInventario,
    Recepciones,
    Envios,
    EditEnvio,
    EditRecepcion,
    SelectorFecha,
    PlanificadorSemanal,
    PlanificadorSemanalResumen,
    ResumenAgente,
    ControlHorario,
    PedidosWeb,
    NewPedido,
    ConsultaStock,
  },
  subviews: {},
  routes: {
    "/": { type: "view", view: "Home" },
    "/home": { type: "view", view: "Home" },
    "/inventarios": { type: "view", view: "Inventarios" },
    "/inventarios/new": { type: "view", view: "NewInventario" },
    "/inventarios/edit/:idSincro": { type: "view", view: "EditInventario" },
    "/recepciones": { type: "view", view: "Recepciones" },
    "/envios": { type: "view", view: "Envios" },
    "/editenvio/:idEnvio": { type: "view", view: "EditEnvio" },
    "/editrecepcion/:idRecepcion": { type: "view", view: "EditRecepcion" },
    "/year": { type: "view", view: "SelectorFecha" },
    "/planificador_semanal": { type: "view", view: "PlanificadorSemanal" },
    "/planificador_semanal_resumen": { type: "view", view: "PlanificadorSemanalResumen" },
    "/resumen_agente": { type: "view", view: "ResumenAgente" },
    "/control_horario": { type: "view", view: "ControlHorario" },
    "/pedidos_web": { type: "view", view: "PedidosWeb" },
    "/new_pedido": { type: "view", view: "NewPedido" },
    "/new_pedido/:idComanda": { type: "view", view: "NewPedido" },
    "/consulta_stock": { type: "view", view: "ConsultaStock" },
  },
  dependencies: [core, login],
  schemas,
  menus: {
    app: AppMenu,
  },

  rules: {
    "Home:visit": true,
    // "Inventarios:visit": ["ADMIN"].includes(group) ? true : false,
    // "NewInventario:visit": ["ADMIN"].includes(group) ? true : false,
    // "EditInventario:visit": ["ADMIN"].includes(group) ? true : false,
    // "Recepciones:visit": ["ADMIN"].includes(group) ? true : false,
    // "Envios:visit": ["ADMIN"].includes(group) ? true : false,
    // "EditEnvio:visit": ["ADMIN"].includes(group) ? true : false,
    // "EditRecepcion:visit": ["ADMIN"].includes(group) ? true : false,
    // "SelectorFecha:visit": ["ADMIN"].includes(group) ? true : false,
    "PlanificadorSemanal:visit": ["ADMIN", "RRHHPLUS", "RRHH", "ENCAR"].includes(group)
      ? true
      : false,
    "PlanificadorSemanalResumen:visit": ["ADMIN", "RRHHPLUS", "RRHH", "ENCAR"].includes(group)
      ? true
      : false,
    // "ResumenAgente:visit": ["ADMIN"].includes(group) ? true : false,
    // "ControlHorario:visit": ["ADMIN"].includes(group) ? true : false,
    // "PedidosWeb:visit": ["ADMIN"].includes(group) ? true : false,
    "OnlyAdmin:visit": ["ADMIN"].includes(group) ? true : false,
  },
};
