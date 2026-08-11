import { ListaSeleccionable } from "@olula/lib/diseño.js";
import { Pedido } from "../../pedido/diseño.ts";
import { AlbaranCreado, LineaAlbaranarPedido } from "../diseño.ts";

export type EstadoAlbaranarPedido =
    | "INICIAL"
    | "VACIO"
    | "CARGANDO"
    | "LISTO"
    | "CONFIRMANDO_ALBARANADO"
    | "ALBARAN_CREADO";

export type ContextoAlbaranarPedido = {
    estado: EstadoAlbaranarPedido;
    pedido: Pedido;
    lineas: ListaSeleccionable<LineaAlbaranarPedido>;
    albaranCreado?: AlbaranCreado;
};
