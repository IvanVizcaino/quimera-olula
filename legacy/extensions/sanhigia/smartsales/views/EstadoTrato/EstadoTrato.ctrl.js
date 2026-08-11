import { getSchemas, util } from "quimera";
import { ACL } from "quimera/lib";

export const state = parent => ({
  ...parent,
  aprobandoPresupuesto: false,
  codDirCli: null,
  crearPedido: false,
  creandoPedido: false,
  crearPresupuesto: false,
  creandoPresupuesto: false,
  creandoLicenciaFarma: false,
  dirCanaria: false,
  modalCausaPerdidaVisible: false,
  modalFechasLicencia: false,
  origenMercanciaOptions: [
    { key: "Exportaciones", value: "Península" },
    { key: "IGIC", value: "Canarias" },
  ],
  regimenIva: null,
  trato: null,
  tratoBuffer: {},
  solicitarEvento: null,
  modalSolicitarEvento: false,
});

export const bunch = parent => ({
  ...parent,
  onInit: [
    {
      type: "setStateKeys",
      plug: ({ tratoProp, noMostrarBotonesProp, refreshCallback }) => ({
        keys: {
          trato: tratoProp,
          tratoBuffer: tratoProp,
          noMostrarBotones: noMostrarBotonesProp,
          refreshCallback,
        },
      }),
    },
  ],
  toggleCrearPedido: [
    {
      type: "setStateKey",
      plug: (_, { crearPedido }) => ({
        path: "crearPedido",
        value: !crearPedido,
      }),
    },
  ],
  toggleCreandoPedido: [
    {
      type: "setStateKey",
      plug: (_, { creandoPedido }) => ({
        path: "creandoPedido",
        value: !creandoPedido,
      }),
    },
  ],
  toggleAprobandoPresupuesto: [
    {
      type: "setStateKey",
      plug: (_, { aprobandoPresupuesto }) => ({
        path: "aprobandoPresupuesto",
        value: !aprobandoPresupuesto,
      }),
    },
  ],
  cancelarCrearLicenciaFarma: [
    {
      type: "setStateKey",
      plug: () => ({ path: "modalFechasLicencia", value: false }),
    },
  ],
  crearLicenciaFarma: [
    {
      type: "setStateKey",
      plug: () => ({ path: "modalFechasLicencia", value: false }),
    },
    {
      type: "grape",
      name: "toggleCreandoLicencia",
    },
    {
      type: "post",
      schema: getSchemas().licencias,
      data: (_, { trato, tratoBuffer }) => ({
        idTrato: trato.idTrato,
        codCliente: trato.cliente,
        fechaCaducidad: tratoBuffer.fechaLicenciaCaducidad,
        fechaFinProceso: tratoBuffer.fechaLicenciaFin, // Fecha aprobación o rechazo
        fechaInicioProceso: trato.fecha,
        tipo: "Tratamiento de regeneración ósea",
      }),
      success: "onCrearLicenciaSuccess",
      error: "onCrearLicenciaError",
    },
  ],
  onCrearLicenciaSuccess: [
    {
      type: "showMessage",
      plug: () => ({
        mensaje: "Licencia creada correctamente",
        tipoMensaje: "success",
      }),
    },
    {
      type: "grape",
      name: "onTratoBufferEstadoChanged",
      plug: () => ({ value: "Ganado" }),
    },
    {
      type: "grape",
      name: "toggleCreandoLicencia",
    },
  ],
  onCrearLicenciaError: [
    {
      type: "showMessage",
      plug: () => ({
        mensaje: "Error al crear la licencia",
        tipoMensaje: "error",
      }),
    },
  ],
  borraLicenciaFarma: [
    {
      type: "delete",
      schema: getSchemas().licencias,
      id: (_, { trato }) => trato.idLicencia,
      success: "onTratoBufferEstadoChanged",
      error: "onBorrarLicenciaFarmaError",
    },
  ],
  onBorrarLicenciaFarmaError: [
    {
      type: "showMessage",
      plug: () => ({
        mensaje: "Error al borrar la licencia asociada",
        tipoMensaje: "error",
      }),
    },
  ],
  onCrearPedidoClicked: [
    {
      condition: (_, { trato }) => !!trato.codAgente,
      type: "grape",
      name: "puedoCrearPedido",
    },
    {
      condition: (_, { trato }) => !trato.codAgente,
      type: "grape",
      name: "noPuedoCrearPedido",
    },
  ],
  puedoCrearPedido: [
    {
      condition: (_, { trato }) =>
        !trato.idPresupuesto && (!trato.cliente || (trato.cliente && !trato.dirAuto)),
      type: "grape",
      name: "toggleCrearPedido",
    },
    {
      condition: (_, { trato }) => !trato.idPresupuesto && trato.cliente && trato.dirAuto,
      type: "grape",
      name: "solicitarEvento",
      plug: () => ({ solicitarEvento: "pedido" }),
    },
  ],
  solicitarEvento: [
    {
      type: "setStateKeys",
      plug: ({ solicitarEvento }) => ({
        keys: {
          modalSolicitarEvento: true,
          solicitarEvento,
        },
      }),
    },
  ],
  noPuedoCrearPedido: [
    {
      type: "showMessage",
      plug: () => ({
        mensaje: "No se puede crear el pedido. Este trato no tiene un agente asigando.",
        tipoMensaje: "error",
      }),
    },
  ],
  onNuevoPedidoSeccionCancelada: [
    {
      type: "grape",
      name: "toggleCrearPedido",
    },
  ],
  onNuevoPedidoSeccionConfirmada: [
    {
      type: "grape",
      name: "toggleCrearPedido",
    },
    {
      type: "grape",
      name: "crearPedidoTrato",
    },
  ],
  crearPedidoTrato: [
    {
      type: "grape",
      name: "toggleCreandoPedido",
    },
    {
      type: "post",
      schema: getSchemas().nuevoPedidoTrato,
      action: "crear_pedido_trato",
      data: (_, { trato, tratoBuffer, codDirCli, regimenIva }) => ({
        idTrato: trato.idTrato,
        codAgente: trato.codAgente,
        codCliente: trato.cliente,
        fechasalida: util.today(),
        codEvento: tratoBuffer.codEvento,
        codDir: codDirCli,
        idCampania: trato.idCampania,
        regimenIva,
      }),
      success: "onNuevoPedidoMktGuardado",
      error: "onNuevoPedidoMktError",
    },
  ],
  onNuevoPedidoMktError: [
    {
      type: "showMessage",
      plug: ({ response }) => ({
        mensaje: `No se ha creado el pedido. Error: ${response}`,
        tipoMensaje: "error",
      }),
    },
    {
      type: "grape",
      name: "toggleCreandoPedido",
    },
  ],
  onNuevoPedidoMktGuardado: [
    {
      type: "grape",
      name: "onNuevoPedidoGuardado",
      plug: ({ response }) => ({ idPedido: response, event: "created" }),
    },
  ],
  onNuevoPedidoGuardado: [
    {
      type: "grape",
      name: "toggleCrearPedido",
    },
    {
      condition: ({ event }) => event === "created",
      type: "grape",
      name: "onTratoBufferEstadoChanged",
      plug: () => ({ value: "Ganado" }),
    },
    {
      condition: ({ event, idPedido }) => !!idPedido && event === "created",
      type: "navigate",
      url: ({ idPedido }) => `/ventas/pedidos/${idPedido}`,
    },
  ],
  onIrAPedidoClicked: [
    {
      condition: (_, { trato }) => !!trato.idPedido,
      type: "navigate",
      url: (_, { trato }) => `/ventas/pedidos/${trato.idPedido}`,
    },
  ],
  onIrAPresupuestoClicked: [
    {
      condition: (_, { trato }) => !!trato.idPresupuesto,
      type: "navigate",
      url: (_, { trato }) => `/ventas/presupuestos/${trato.idPresupuesto}`,
    },
  ],
  toggleCrearPresupuesto: [
    {
      type: "setStateKey",
      plug: (_, { crearPresupuesto }) => ({
        path: "crearPresupuesto",
        value: !crearPresupuesto,
      }),
    },
  ],
  toggleCreandoPresupuesto: [
    {
      type: "setStateKey",
      plug: (_, { creandoPresupuesto }) => ({
        path: "creandoPresupuesto",
        value: !creandoPresupuesto,
      }),
    },
  ],
  toggleCreandoLicencia: [
    {
      type: "setStateKey",
      plug: (_, { creandoLicenciaFarma }) => ({
        path: "creandoPresupuesto",
        value: !creandoLicenciaFarma,
      }),
    },
  ],
  onCrearPresupuestoClicked: [
    {
      condition: (_, { trato }) => !!trato.codAgente,
      type: "grape",
      name: "puedoCrearPresupuesto",
    },
    {
      condition: (_, { trato }) => !trato.codAgente,
      type: "grape",
      name: "noPuedoCrearPresupuesto",
    },
  ],
  puedoCrearPresupuesto: [
    {
      condition: (_, { trato }) => !trato.cliente || (trato.cliente && !trato.dirAuto),
      type: "grape",
      name: "toggleCrearPresupuesto",
    },
    {
      condition: (_, { trato }) => trato.cliente && trato.dirAuto,
      type: "grape",
      name: "solicitarEvento",
      plug: () => ({ solicitarEvento: "presupuesto" }),
    },
  ],
  noPuedoCrearPresupuesto: [
    {
      type: "showMessage",
      plug: () => ({
        mensaje: "No se puede crear el presupuesto. Este trato no tiene un agente asigando.",
        tipoMensaje: "error",
      }),
    },
  ],
  onNuevoPresupuestoSeccionCancelada: [
    {
      type: "grape",
      name: "toggleCrearPresupuesto",
    },
  ],
  onNuevoPresupuestoSeccionConfirmada: [
    {
      type: "grape",
      name: "toggleCrearPresupuesto",
    },
    {
      type: "grape",
      name: "crearPresupuestoTrato",
    },
  ],
  crearPresupuestoTrato: [
    {
      type: "grape",
      name: "toggleCreandoPresupuesto",
    },
    {
      type: "post",
      schema: getSchemas().nuevoPresupuestoTrato,
      action: "crear_presupuesto_trato",
      data: (_, { trato, tratoBuffer, regimenIva, codDirCli }) => ({
        idTrato: trato.idTrato,
        idCampania: trato.idCampania,
        codCliente: trato.cliente,
        codAgente: trato.codAgente,
        codEvento: tratoBuffer.codEvento,
        codDir: codDirCli,
        regimenIva,
      }),
      success: "onNuevoPresupuestoMktGuardado",
      error: "onNuevoPresupuestoMktError",
    },
  ],
  onNuevoPresupuestoMktError: [
    {
      type: "showMessage",
      plug: ({ response }) => ({
        mensaje: `No se ha creado el presupuesto. Error: ${response}`,
        tipoMensaje: "error",
      }),
    },
    {
      type: "grape",
      name: "toggleCreandoPresupuesto",
    },
  ],
  onNuevoPresupuestoMktGuardado: [
    {
      type: "grape",
      name: "onNuevoPresupuestoGuardado",
      plug: ({ response }) => ({ idPresupuesto: response, event: "created" }),
    },
  ],
  onNuevoPresupuestoGuardado: [
    {
      type: "grape",
      name: "toggleCrearPresupuesto",
    },
    {
      condition: ({ event, idPresupuesto }) => !!idPresupuesto && event === "created",
      type: "navigate",
      url: ({ idPresupuesto }) => `/ventas/presupuestos/${idPresupuesto}`,
    },
  ],
  onAprobarPresupuestoClicked: [
    {
      type: "grape",
      name: "toggleAprobandoPresupuesto",
    },
    {
      type: "patch",
      schema: getSchemas().trato,
      id: () => "-static-",
      data: (_, { trato }) => ({
        idpresupuesto: trato.idPresupuesto,
        idpedido: trato.idPedido,
        idtrato: trato.idTrato,
      }),
      action: "aprobar_presupuesto",
      success: "presupuestoAprobado",
      error: "aprobarPresupuestoError",
    },
  ],
  aprobarPresupuestoError: [
    {
      type: "showMessage",
      plug: ({ response }) => ({
        mensaje: `No se ha aprobado el presupuesto. Error: ${response}`,
        tipoMensaje: "error",
      }),
    },
    {
      type: "grape",
      name: "toggleAprobandoPresupuesto",
    },
  ],
  presupuestoAprobado: [
    {
      type: "patch",
      schema: getSchemas().trato,
      id: () => "-static-",
      data: ({ response }) => ({
        idpedido: response.idpedido,
      }),
      action: "actualiza_estado_pago_borrador",
      success: "estadoPagoBorradorActualizado",
      error: "aprobarPresupuestoError",
    },
  ],
  estadoPagoBorradorActualizado: [
    {
      type: "patch",
      schema: getSchemas().pedidos,
      id: ({ response }) => response.idpedido,
      action: "enviar_pda",
      success: "terminarPresupuestoAprobado",
      error: "pedidoEnviarPdaError",
    },
  ],
  terminarPresupuestoAprobado: [
    {
      type: "grape",
      name: "toggleAprobandoPresupuesto",
    },
    {
      type: "grape",
      name: "cambiarEstadoGanado",
      plug: payload => ({ ...payload, value: "Ganado" }),
    },
  ],
  pedidoEnviarPdaError: [
    {
      type: "showMessage",
      plug: () => ({
        mensaje: "Error al enviar el pedido",
        tipoMensaje: "error",
      }),
    },
    {
      type: "grape",
      name: "terminarPresupuestoAprobado",
    },
  ],
  compruebaAccionCambioEstadoTrato: [
    {
      condition: (_, { trato }) =>
        trato.idTipotrato === util.getUser().tratolicenciafarma && ACL.can("crm.trato.farma"),
      type: "grape",
      name: "onEstadoTratoTipoFarmaChanged",
    },
    {
      condition: (_, { trato }) => trato.idTipotrato !== util.getUser().tratolicenciafarma,
      type: "grape",
      name: "onEstadoTratoComunChanged",
    },
  ],
  onEstadoTratoComunChanged: [
    {
      condition: ({ value }, { trato }) => value !== "Ganado" || !trato.exigirGenerarPedido,
      type: "grape",
      name: "onTratoBufferEstadoChanged",
    },
    {
      condition: ({ value }, { trato }) =>
        value === "Ganado" && trato.exigirGenerarPedido && trato.idPresupuesto,
      type: "grape",
      name: "onAprobarPresupuestoClicked",
    },
    {
      condition: ({ value }, { trato }) =>
        value === "Ganado" && trato.exigirGenerarPedido && !trato.idPresupuesto,
      type: "grape",
      name: "onCrearPedidoClicked",
    },
  ],
  onEstadoTratoTipoFarmaChanged: [
    {
      condition: ({ value }) => value === "Ganado",
      type: "setStateKey",
      plug: () => ({ path: "modalFechasLicencia", value: true }),
    },
    {
      condition: ({ value }, { trato }) => value !== "Ganado" && !!trato.idLicencia,
      type: "grape",
      name: "borraLicenciaFarma",
    },
    {
      condition: ({ value }, { trato }) => value !== "Ganado" && !trato.idLicencia,
      type: "grape",
      name: "onTratoBufferEstadoChanged",
    },
  ],
  onCearLicenciaFarmaConfirm: [
    {
      type: "grape",
      name: "crearLicenciaFarma",
    },
  ],
  onTratoBufferEstadoChanged: [
    {
      log: ({ value }) => ["Mi log juanma", value],
      condition: ({ value }) => value === "Perdido",
      type: "grape",
      name: "abrirModalCausaPerdida",
    },
    {
      condition: ({ value }) => value === "Ganado",
      type: "grape",
      name: "cambiarEstadoGanado",
    },
    {
      condition: ({ value }) => value === "-",
      type: "grape",
      name: "cambiarEstadoNulo",
    },
  ],
  cambiarEstadoNulo: [
    {
      type: "setStateKey",
      plug: () => ({ path: "tratoBuffer.idPerdida", value: null }),
    },
    {
      type: "grape",
      name: "onSeccionConfirmada",
      plug: payload => ({ ...payload, fields: ["idPerdida"] }),
    },
    {
      type: "grape",
      name: "cambiarEstadoTrato",
      plug: () => ({ value: "-" }),
    },
  ],
  cambiarEstadoGanado: [
    {
      type: "setStateKey",
      plug: () => ({ path: "tratoBuffer.idPerdida", value: null }),
    },
    {
      type: "grape",
      name: "onCausaSeccionConfirmada",
    },
    {
      type: "grape",
      name: "cambiarEstadoTrato",
    },
  ],
  abrirModalCausaPerdida: [
    {
      type: "setStateKey",
      plug: () => ({ path: "modalCausaPerdidaVisible", value: true }),
    },
  ],
  cancelarModalCausaPerdida: [
    {
      type: "setStateKey",
      plug: () => ({ path: "modalCausaPerdidaVisible", value: false }),
    },
    {
      type: "setStateKey",
      plug: () => ({ path: "tratoBuffer.idPerdida", value: null }),
    },
  ],
  confirmarCausaPerdida: [
    {
      type: "setStateKey",
      plug: () => ({ path: "modalCausaPerdidaVisible", value: false }),
    },
    {
      type: "grape",
      name: "onCausaSeccionConfirmada",
    },
    {
      type: "grape",
      name: "cambiarEstadoTrato",
      plug: () => ({ value: "Perdido" }),
    },
  ],
  cambiarEstadoTrato: [
    {
      type: "setStateKey",
      plug: ({ value }) => ({ path: "tratoBuffer.estado", value }),
    },
    {
      type: "grape",
      name: "onSeccionConfirmada",
      plug: payload => ({ ...payload, fields: ["estado"] }),
    },
  ],
  onCausaSeccionConfirmada: [
    {
      type: "grape",
      name: "onSeccionConfirmada",
      plug: payload => ({ ...payload, fields: ["idPerdida"] }),
    },
  ],
  onCausaSeccionCancelada: [
    {
      type: "grape",
      name: "onSeccionCancelada",
      plug: () => ({ fields: ["idPerdida"] }),
    },
  ],
  onSeccionConfirmada: [
    {
      type: "setStateKey",
      plug: ({ fields }, { trato, tratoBuffer }) => ({
        path: "trato",
        value: fields.reduce((accum, item) => ({ ...accum, [item]: tratoBuffer[item] }), trato),
      }),
    },
    {
      condition: ({ onSuccess }) => !!onSuccess,
      type: "function",
      function: ({ onSuccess }) => onSuccess && onSuccess(),
    },
    {
      type: "patch",
      schema: getSchemas().trato,
      id: (_, { trato }) => trato.idTrato,
      data: ({ fields }, { trato }) =>
        fields.reduce((accum, key) => ({ ...accum, [key]: trato[key] }), {}),
      success: "onTratoUpdated",
    },
    {
      type: "grape",
      name: "refreshCallback",
    },
  ],
  onTratoUpdated: [
    {
      type: "showMessage",
      plug: () => ({
        mensaje: "Trato actualizado correctamente",
        tipoMensaje: "success",
      }),
    },
    {
      type: "grape",
      name: "refreshCallback",
    },
  ],
  onSeccionCancelada: [
    {
      type: "setStateKey",
      plug: ({ fields }, { trato, tratoBuffer }) => ({
        path: "tratoBuffer",
        value: fields.reduce((accum, item) => ({ ...accum, [item]: trato[item] }), tratoBuffer),
      }),
    },
  ],
  refreshCallback: [
    {
      type: "function",
      function: (_, { refreshCallback }) => refreshCallback && refreshCallback(),
    },
  ],
  onCodDirCliChanged: [
    {
      type: "setStateKey",
      plug: ({ value }) => ({ path: "codDirCli", value }),
    },
    {
      condition: ({ value }) => !!value,
      type: "grape",
      name: "compruebaCanarias",
    },
    {
      condition: ({ value }) => !value,
      type: "grape",
      name: "setDirCanarias",
      plug: () => ({ esCanariasValue: false }),
    },
  ],
  compruebaCanarias: [
    {
      type: "get",
      schema: getSchemas().dirClientes,
      action: "check_dir_canarias",
      id: ({ value }) => value,
      success: "compruebaCanariasSuccess",
    },
  ],
  compruebaCanariasSuccess: [
    {
      type: "grape",
      name: "setDirCanarias",
      plug: ({ response }) => ({ esCanariasValue: response.esCanarias }),
    },
  ],
  setDirCanarias: [
    {
      type: "setStateKey",
      plug: ({ esCanariasValue }) => ({ path: "dirCanaria", value: esCanariasValue }),
    },
    {
      type: "setStateKeys",
      plug: ({ esCanariasValue }) => ({
        keys: {
          dirCanaria: esCanariasValue,
          regimenIva: esCanariasValue ? "Exportaciones" : null,
        },
      }),
    },
  ],
  onRegimenIvaChanged: [
    {
      type: "setStateKey",
      plug: ({ value }) => ({ path: "regimenIva", value }),
    },
  ],
  onNuevoPedidoSectionCancelled: [
    {
      type: "setStateKeys",
      plug: () => ({
        keys: {
          codDirCli: null,
          regimenIva: null,
          dirCanaria: false,
        },
      }),
    },
  ],
  onNuevoPresupuestoSectionCancelled: [
    {
      type: "setStateKeys",
      plug: () => ({
        keys: {
          codDirCli: null,
          regimenIva: null,
          dirCanaria: false,
        },
      }),
    },
  ],
  onSeleccionaEventoSectionCancelled: [
    {
      type: "setStateKey",
      plug: () => ({ path: "modalSolicitarEvento", value: false }),
    },
    {
      type: "setStateKey",
      plug: () => ({ path: "tratoBuffer.codEvento", value: null }),
    },
  ],
  onSeleccionaEventoSeccionConfirmada: [
    {
      type: "setStateKey",
      plug: () => ({ path: "modalSolicitarEvento", value: false }),
    },
    {
      condition: (_, { solicitarEvento }) => solicitarEvento === "pedido",
      type: "grape",
      name: "crearPedidoTrato",
    },
    {
      condition: (_, { solicitarEvento }) => solicitarEvento === "presupuesto",
      type: "grape",
      name: "crearPresupuestoTrato",
    },
  ],
});
