import { util } from "quimera";
import { applyBunch, shortcutsBunch, shortcutsState } from "quimera/lib";

import data from "./PedidoGenerarPreparaciones.ctrl.yaml";

export const state = parent => ({
  ...parent,
  ...shortcutsState(data.shortcuts),
  ...data.state,
  logic: {
    ...parent.logic,
    pedidoEditable: pedido => pedido.editable && pedido.estadoPda !== "Enviado",
  },
});

export const bunch = parent => {
  const parentConShortCuts = {
    ...parent,
    ...shortcutsBunch(data.shortcuts),
    onCantidadChanged: [],
    onAtrasClicked: [
      {
        type: "function",
        function: () => window.history.back(),
      },
    ],
    onQuitarTrabajadorClicked: [
      {
        type: "userConfirm",
        question: () => ({
          titulo: "Quitar trabajador",
          cuerpo: "Seguro que desea quitar el trabajador asignado a este pedido.",
          textoSi: "CONFIRMAR",
          textoNo: "CANCELAR",
        }),
        onConfirm: "onQuitarTrabajadorConfirmado",
        onCancel: "focusCodBarras",
      },
    ],
    compruebaCambiaEstadoPda: [
      {
        condition: ({ response }, { pedido }) =>
          !!response?.estadoPda && pedido.buffer?.estadoPda !== response?.estadoPda,
        type: "grape",
        name: "onEstadoPdaActualizado",
      },
    ],
    compruebaLineasConDescuento: [
      {
        type: "setStateKey",
        plug: ({ }) => ({ path: "status.lineasConDto", value: false }),
      },
      {
        condition: ({ response },) => response.data.find(l => l.shCantAlbaran !== 0 && l.dtoLineal !== 0),
        type: "setStateKey",
        plug: ({ }) => ({ path: "status.lineasConDto", value: true }),
      }
    ],
    onQuitarTrabajadorConfirmado: [
      {
        type: "grape",
        name: "onTrabajadorActualizado",
        plug: payload => ({ codTrabajador: null, nombreTrabajador: null, ...payload }),
      },
    ],
    compruebaAniadirTrabajador: [
      {
        condition: (_, { pedido }) =>
          pedido.buffer.codtrabajador !== util.getUser().codtrabajador,
        type: "grape",
        name: "onTrabajadorActualizado",
        plug: payload => ({
          codTrabajador: util.getUser().codtrabajador,
          nombreTrabajador: util.getUser().nombretrabajador,
          ...payload,
        }),
      },
    ],
    focusCodBarras: [
      {
        condition: () => !!document.getElementById("codBarras"),
        type: "function",
        function: () => document.getElementById("codBarras").select(),
      },
    ],
    irAMovilotes: [
      {
        type: "navigate",
        url: ({ idLinea }, { pedido }) =>
          `/generarpreparaciones/${pedido.buffer.idPedido}/movilotes/${idLinea}`,
      },
    ],
    onTdbLineasPedidoCliRowClicked: [
      {
        log: () => ["ON WHOAMI"],
      },
    ],
    mostrarMensajeError: [
      {
        type: "showMessage",
        plug: ({ response }) => ({
          mensaje: response,
          tipoMensaje: "error",
        }),
      },
    ],
  };

  return {
    ...parentConShortCuts,
    ...applyBunch(data.bunch, parentConShortCuts),
  };
};
