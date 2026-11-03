import { getSchemas } from "quimera";

export const state = parent => ({
  ...parent,
  tareas: [],
  tratos: [],
  diaSeleccionado: null,
  tareasDia: [],
  tratosDia: [],
});

export const bunch = parent => ({
  ...parent,
  onInit: [
    {
      type: "get",
      schema: getSchemas().trato,
      id: () => "-static-",
      action: "get_for_agenda",
      success: "onTratosRecieved",
    },
    {
      type: "get",
      schema: getSchemas().tarea,
      id: () => "-static-",
      action: "get_for_agenda",
      success: "onTareasRecieved",
    },
  ],
  onTratosRecieved: [
    {
      type: "setStateKey",
      plug: ({ response }) => ({
        path: "tratos",
        value: response.data,
      }),
    },
  ],
  onTareasRecieved: [
    {
      type: "setStateKey",
      plug: ({ response }) => ({
        path: "tareas",
        value: response.data,
      }),
    },
  ],
  onDiaSeleccionado: [
    {
      type: "setStateKeys",
      plug: ({ fecha }) => ({
        keys: { diaSeleccionado: fecha, tareasDia: null, tratosDia: null },
      }),
    },
    {
      condition: ({ fecha }) => !!fecha,
      type: "get",
      schema: getSchemas().trato,
      id: () => "-static-",
      action: "get_for_dia",
      params: ({ fecha }) => ({ dia: fecha }),
      success: "onTratosDiaRecieved",
    },
    {
      condition: ({ fecha }) => !!fecha,
      type: "get",
      schema: getSchemas().tarea,
      id: () => "-static-",
      action: "get_for_dia",
      params: ({ fecha }) => ({ dia: fecha }),
      success: "onTareasDiaRecieved",
    },
  ],
  onTratosDiaRecieved: [
    {
      type: "setStateKey",
      plug: ({ response }) => ({
        path: "tratosDia",
        value: response.data,
      }),
    },
  ],
  onTareasDiaRecieved: [
    {
      type: "setStateKey",
      plug: ({ response }) => ({
        path: "tareasDia",
        value: response.data,
      }),
    },
  ],
});
