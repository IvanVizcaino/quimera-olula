import { getSchemas, util } from "quimera";
import { DetailAPI, DetailCtrl } from "quimera/lib";

export const state = parent => ({
  ...parent,
  desdeMasterTareas: false,
  idTarea: null,
  idTrato: null,
  tipoTarea: null,
  refreshCallback: null,
  tareaBuffer: {},
  noEncontrado: false,
  modalFechaHoraFin: false,
  modalSiguienteTarea: false,
  modalEstadoTrato: false,
  tarea: DetailCtrl(getSchemas().tarea),
  trato: DetailCtrl(getSchemas().tratoTarea),
});

export const bunch = parent => ({
  ...parent,
  ...DetailAPI({
    name: "tarea",
    key: "idTarea",
    schema: getSchemas().tarea,
  }),
  ...DetailAPI({
    name: "trato",
    key: "idTrato",
    schema: getSchemas().tratoTarea,
    forcePk: true,
    action: "get_for_tarea",
  }),
  onInit: [
    {
      type: "setStateKeys",
      plug: ({ desdeMasterTareas, idTarea, refreshCallback, tipoTarea }) => ({
        keys: {
          desdeMasterTareas,
          idTarea,
          refreshCallback,
          tipoTarea,
        },
      }),
    },
    {
      type: "grape",
      name: "getTarea",
    },
  ],
  onGetTareaSucceded: [
    {
      type: "setStateKey",
      plug: (_, { tarea }) => ({
        path: "noEncontrado",
        value: !tarea?.idTarea,
      }),
    },
    {
      type: "grape",
      name: "dameTrato",
    },
    {
      type: "grape",
      name: "cargaBuffer",
    },
    {
      condition: ({ tipoTarea }) => !!tipoTarea,
      type: "grape",
      name: "onTareaNow",
    },
  ],
  dameTrato: [
    {
      type: "setStateKey",
      plug: (_, { tarea }) => ({ path: "idTrato", value: tarea.idTrato }),
    },
    {
      type: "grape",
      name: "getTrato",
    },
  ],
  onGetTratoSucceded: [
    {
      type: "grape",
      name: "getTengoDirAuto",
    },
  ],
  cargaBuffer: [
    {
      type: "setStateKey",
      plug: (_, { tarea }) => ({ path: "tareaBuffer", value: { ...tarea } }),
    },
  ],
  getTengoDirAuto: [
    {
      type: "get",
      schema: getSchemas().dirAutoClientes,
      action: "data_direcciones_cliente",
      id: () => "-static-",
      params: (_, { trato }) => ({
        codcliente: trato.cliente,
      }),
      success: "onGetTengoDirAutoSucceeded",
    },
  ],
  onGetTengoDirAutoSucceeded: [
    {
      type: "setStateKey",
      plug: ({ response }) => ({
        path: "trato.dirAuto",
        value: response?.data?.dirAuto,
      }),
    },
  ],
  onSeccionConfirmada: [
    {
      type: "setStateKey",
      plug: ({ fields }, { tarea, tareaBuffer }) => ({
        path: "tarea",
        value: fields.reduce((accum, item) => ({ ...accum, [item]: tareaBuffer[item] }), tarea),
      }),
    },
    {
      condition: ({ onSuccess }) => !!onSuccess,
      type: "function",
      function: ({ onSuccess }) => onSuccess && onSuccess(),
    },
    {
      type: "patch",
      schema: getSchemas().tarea,
      id: (_, { tarea }) => tarea.idTarea,
      data: ({ fields }, { tarea }) =>
        fields.reduce((accum, key) => ({ ...accum, [key]: tarea[key] }), {}),
      success: "onTareaUpdated",
    },
    {
      type: "grape",
      name: "refreshCallback",
    },
    {
      condition: (_, { tarea }) => !!tarea.completada,
      type: "grape",
      name: "toogleModalSiguienteTarea",
    },
    {
      type: "setStateKey",
      plug: () => ({ path: "modalFechaHoraFin", value: false }),
    },
    {
      condition: (_, { tarea, toogleModalFechaHoraFin }) =>
        !!tarea.completada && !!toogleModalFechaHoraFin,
      type: "grape",
      name: "toogleModalFechaHoraFin",
    },
  ],
  abrirModalFechaHoraFin: [
    {
      type: "setStateKeys",
      plug: (_, { tareaBuffer }) => ({
        keys: {
          modalFechaHoraFin: true,
          tareaBuffer: {
            ...tareaBuffer,
            fechaFin: util.today(),
            horaFin: util.now(),
          },
        },
      }),
    },
  ],
  toogleModalSiguienteTarea: [
    {
      type: "setStateKey",
      plug: (_, { modalSiguienteTarea }) => ({
        path: "modalSiguienteTarea",
        value: !modalSiguienteTarea,
      }),
    },
  ],
  onTareaUpdated: [
    {
      type: "showMessage",
      plug: () => ({
        mensaje: "Tarea actualizada correctamente",
        tipoMensaje: "success",
      }),
    },
  ],
  onSeccionCancelada: [
    {
      type: "setStateKey",
      plug: ({ fields }, { tarea, tareaBuffer }) => ({
        path: "tareaBuffer",
        value: fields.reduce((accum, item) => ({ ...accum, [item]: tarea[item] }), tareaBuffer),
      }),
    },
  ],
  onCabeceraSeccionConfirmada: [
    {
      type: "grape",
      name: "onSeccionConfirmada",
      plug: payload => ({ ...payload, fields: ["titulo"] }),
    },
  ],
  onCabeceraSeccionCancelada: [
    {
      type: "grape",
      name: "onSeccionCancelada",
      plug: () => ({ fields: ["titulo"] }),
    },
  ],
  onTipoSeccionConfirmada: [
    {
      type: "grape",
      name: "onSeccionConfirmada",
      plug: payload => ({ ...payload, fields: ["tipo"] }),
    },
  ],
  onTipoSeccionCancelada: [
    {
      type: "grape",
      name: "onSeccionCancelada",
      plug: () => ({ fields: ["tipo"] }),
    },
  ],
  onFechaSeccionConfirmada: [
    {
      type: "grape",
      name: "onSeccionConfirmada",
      plug: payload => ({ ...payload, fields: ["fecha", "hora"] }),
    },
  ],
  onFechaSeccionCancelada: [
    {
      type: "grape",
      name: "onSeccionCancelada",
      plug: () => ({ fields: ["fecha", "hora"] }),
    },
  ],
  onNotaSeccionConfirmada: [
    {
      type: "grape",
      name: "onSeccionConfirmada",
      plug: payload => ({ ...payload, fields: ["nota"] }),
    },
  ],
  onNotaSeccionCancelada: [
    {
      type: "grape",
      name: "onSeccionCancelada",
      plug: () => ({ fields: ["nota"] }),
    },
  ],
  onTareaBufferCompletadaChanged: [
    {
      type: "setStateKeys",
      plug: ({ value, latitud, longitud }, { tareaBuffer }) => ({
        keys: {
          tareaBuffer: {
            ...tareaBuffer,
            completada: value,
            latitudFin: value ? latitud : null,
            longitudFin: value ? longitud : null,
            fechaFin: value ? tareaBuffer.fechaFin : null,
            horaFin: value ? tareaBuffer.horaFin : null,
            direccionFin: value ? tareaBuffer.direccionFin : null,
          },
        },
      }),
    },
    {
      // condition: ({ value }, { tareaBuffer }) =>
      //   !!value && !tareaBuffer.fechaFin && !tareaBuffer.horaFin,
      condition: ({ value }) => !!value,
      type: "grape",
      name: "abrirModalFechaHoraFin",
    },
    {
      condition: ({ value }) => !value,
      type: "grape",
      name: "descompletarTarea",
    },
  ],
  completarTarea: [
    {
      type: "grape",
      name: "onSeccionConfirmada",
      plug: payload => ({
        ...payload,
        fields: ["completada", "latitudFin", "longitudFin", "fechaFin", "horaFin"],
      }),
    },
  ],
  descompletarTarea: [
    {
      type: "grape",
      name: "onSeccionConfirmada",
      plug: payload => ({
        ...payload,
        fields: ["completada", "latitudFin", "longitudFin", "fechaFin", "horaFin", "direccionFin"],
      }),
    },
  ],
  refreshCallback: [
    {
      type: "function",
      function: (_, { refreshCallback }) => refreshCallback && refreshCallback(),
    },
  ],
  onTareaNow: [
    {
      condition: (_, { tarea }) => tarea?.tipo === "Llamada",
      type: "navigate",
      url: (_, { tarea }) => `tel://+34${tarea?.telefonoContacto}`,
    },
    {
      condition: (_, { tarea }) => tarea?.tipo === "Email",
      type: "navigate",
      url: (_, { tarea }) => `mailto:${tarea?.email}`,
    },
    {
      condition: (_, { tarea }) => tarea?.tipo === "Whatsapp",
      type: "function",
      function: (_, { tarea }) =>
        window.open(`https://wa.me/34${tarea?.telefonoContacto}`, "_blank"),
    },
  ],
  onCloseModalSiguienteTarea: [
    {
      type: "grape",
      name: "toogleModalSiguienteTarea",
    },
    {
      condition: ({ historyBack }, { desdeMasterTareas, trato, tarea }) =>
        !desdeMasterTareas && trato.ultimaTarea !== tarea.idTarea && !!historyBack,
      type: "function",
      function: ({ historyBack }) => window.history.go(historyBack),
    },
    {
      condition: (_, { trato, tarea }) => trato.ultimaTarea === tarea.idTarea,
      type: "grape",
      name: "toogleModalEstadoTrato",
    },
  ],
  toogleModalEstadoTrato: [
    {
      type: "setStateKey",
      plug: (_, { modalEstadoTrato }) => ({ path: "modalEstadoTrato", value: !modalEstadoTrato }),
    },
  ],
  cerrarModalEstadoTrato: [
    {
      type: "setStateKey",
      plug: () => ({ path: "modalEstadoTrato", value: false }),
    },
    {
      condition: ({ historyBack }, { desdeMasterTareas }) => !desdeMasterTareas && !!historyBack,
      type: "function",
      function: ({ historyBack }) => window.history.go(historyBack),
    },
  ],
  getCurrentPositionError: [
    {
      type: "showMessage",
      plug: ({ errorMessage }) => ({
        mensaje: `No se completó la tarea: ${errorMessage}`,
        tipoMensaje: "error",
      }),
    },
  ],
});
