//import { ModelAPI, ModelCtrl } from "quimera/lib";
//import schemas from "../../static/schemas";
import schemas from "./OrdenesCarga.schema";

export const state = parent => ({
  ...parent,
  ordenescarga: [],
  idOrdenCarga: "",
  pagina: 0,
  albaranes: [],
  // Control de los diferentes dialogos
  abrirDialogoConfirmacion: false,
  cargandoAlbaranes: false,
  albaranesGenerados: false,
  imprimirAlbaranes: false,
  errorAlbaranes: false,
  dialogTitle: "",
  dialogMsg: "",
  impresionDone: false,
});

export const bunch = parent => ({
  ...parent,
  onInit: [
    {
      type: "grape",
      name: "cargarOrdenesCarga",
    },
  ],
  cargarOrdenesCarga: [
    {
      type: "get",
      schema: schemas.ordenesCarga,
      filter: () => ({
        or: [
          ["estado", "eq", "PTE"],
          ["estado", "eq", "EN CURSO"],
          ["estado", "eq", "ALBARANADA"],
        ],
      }),
      success: "onOrdenesCargaRecibidos",
    },
  ],
  onOrdenesCargaRecibidos: [
    {
      type: "setStateKeys",
      plug: ({ response }) => ({
        keys: { ordenescarga: response.data, pagina: response.pagina, errorMsg: "" },
      }),
    },
  ],
  onTerminarClicked: [
    {
      type: "get",
      schema: schemas.unidades_orden,
      filter: (payload, state) => ["idordencarga", "eq", `'${payload.data}'`],
      success: "onUnidadesProductoRecibidas",
    },
    {
      type: "setStateKey",
      plug: payload => ({ path: "idOrdenCarga", value: payload.data }),
    },
  ],

  // Inicio de proceso para generacion de albaranes
  // Se comprueba si hay unidades cargadas. Si no hay no se puede generar albaran
  onUnidadesProductoRecibidas: [
    {
      type: "setStateKeys",
      plug: ({ response }, state) => {
        const unidades = response.data;
        const cargadas = unidades.filter(u => u.estado === "CARGADO");
        let dialogTitle = "";
        let dialogMsg = "";
        if (cargadas.length > 0) {
          dialogTitle = "¿Está seguro de seguir?";
          dialogMsg = `Se han cargado ${cargadas.length} unidades producto de un total de ${unidades.length}`;
        } else {
          dialogTitle = "Aviso";
          dialogMsg = "No puede generar albaranes porque no se han cargado unidades de producto.";
        }
        return { keys: { abrirDialogoConfirmacion: true, dialogTitle, dialogMsg } };
      },
    },
  ],
  onCancelarAlbaranesClicked: [
    {
      type: "setStateKey",
      plug: (_p, { abrirDialogoConfirmacion }) => ({
        path: "abrirDialogoConfirmacion",
        value: !abrirDialogoConfirmacion,
      }),
    },
  ],
  onConfirmarAlbaranesClicked: [
    {
      type: "setStateKeys",
      plug: ({ response }) => ({
        keys: {
          abrirDialogoConfirmacion: false,
          cargandoAlbaranes: true,
          dialogTitle: "Generando los albaranes",
          dialogMsg: "Espere mientras se generan los albaranes...",
        },
      }),
    },
    {
      type: "patch",
      schema: schemas.ordenesCarga,
      id: () => "-static-",
      data: (payload, { idOrdenCarga }) => ({ orden: idOrdenCarga }),
      action: "generarAlbaranes",
      success: "onGenerarAlbaranesDone",
      error: "onErrorAlbaranes",
    },
  ],
  onGenerarAlbaranesDone: [
    {
      type: "setStateKeys",
      plug: (payload, { idOrdenCarga }) => {
        const albaranes = payload.response.data;
        const id = idOrdenCarga;
        return {
          keys: {
            cargandoAlbaranes: false,
            albaranesGenerados: true,
            albaranes: albaranes,
            dialogTitle: "Albaranes Generados",
            dialogMsg: `Se han generado los siguientes albaranes asociados a la orden de carga ${id}`,
          },
        };
      },
    },
  ],
  onCerrarAlbaranesGeneradosClicked: [
    {
      type: "setStateKeys",
      plug: () => ({ keys: { albaranesGenerados: false, albaranes: [] } }),
    },
    {
      type: "grape",
      name: "cargarOrdenesCarga",
    },
  ],
  onErrorAlbaranes: [
    {
      type: "setStateKeys",
      plug: () => ({
        keys: {
          cargandoAlbaranes: false,
          errorAlbaranes: true,
          dialogTitle: "Error",
          dialogMsg: "Ha ocurrido un error al intentar generar los albaranes",
        },
      }),
    },
  ],
  onConfirmarImpresionClicked: [
    {
      type: "setStateKeys",
      plug: ({ response }) => ({
        keys: {
          albaranesGenerados: false,
          imprimirAlbaranes: false,
        },
      }),
    },
    {
      type: "patch",
      schema: schemas.ordenesCarga,
      id: () => "-static-",
      action: "imprimirAlbaranes",
      data: (payload, { albaranes }) => ({ albaranes: JSON.stringify(albaranes) }),
      success: "onImprimirAlbaranesDone",
      error: "onErrorImprimir",
    },
    // {
    //   type: "grape",
    //   name: "onImprimirAlbaranesDone"
    // }
  ],
  onImprimirAlbaranesDone: [
    {
      type: "setStateKeys",
      plug: () => ({
        keys: {
          impresionDone: true,
          dialogTitle: "Albaranes Generados",
          dialogMsg: "Los albaranes se han impreso correctamente",
        },
      }),
    },
  ],
  onErrorImprimir: [
    {
      type: "setStateKeys",
      plug: () => ({
        keys: {
          cargandoAlbaranes: false,
          errorAlbaranes: true,
          dialogTitle: "Error",
          dialogMsg: "Ha ocurrido un error al intentar imprimir los albaranes",
        },
      }),
    },
  ],
  onErrorReportOlula: [
    {
      type: "setStateKeys",
      plug: payload => ({
        keys: {
          errorAlbaranes: true,
          dialogTitle: "Error",
          dialogMsg:
            payload?.descripcion || payload?.nombre || "No se ha podido completar la operación",
        },
      }),
    },
  ],
  onTerminarImpresionClicked: [
    {
      type: "setStateKey",
      plug: () => ({ path: "impresionDone", value: false }),
    },
    {
      type: "patch",
      schema: schemas.ordenesCarga,
      id: (_, { idOrdenCarga }) => idOrdenCarga,
      data: () => ({ estado: "TERMINADA" }),
      success: "onOrdenTerminada",
    },
  ],
  onImprimirClicked: [
    {
      type: "setStateKey",
      plug: payload => ({ path: "idOrdenCarga", value: payload.data }),
    },
    {
      type: "patch",
      schema: schemas.ordenesCarga,
      id: () => "-static-",
      data: (payload, { idOrdenCarga }) => ({ orden: idOrdenCarga }),
      action: "dameAlbaranes",
      success: "onGetAlbaranesDone",
      error: "onErrorImprimir",
    },
  ],
  onGetAlbaranesDone: [
    {
      type: "setStateKeys",
      plug: (payload, { idOrdenCarga }) => ({
        keys: {
          albaranes: payload.response.data,
          imprimirAlbaranes: true,
          dialogTitle: "Imprimir Albaranes",
          dialogMsg: `Se van a imprimir los siguientes albaranes asociados a la orden de carga ${idOrdenCarga}`,
        },
      }),
    },
  ],
  onOkClicked: [
    {
      type: "setStateKeys",
      plug: (payload, { idOrdenCarga }) => ({
        keys: {
          abrirDialogoConfirmacion: false,
          errorAlbaranes: false,
        },
      }),
    },
  ],
  onOrdenTerminada: [
    {
      type: "setStateKey",
      plug: (_, { ordenescarga, idOrdenCarga }) => {
        ordenescarga = ordenescarga.filter(oc => oc.idorden !== idOrdenCarga);
        return { path: "ordenescarga", value: ordenescarga };
      },
    },
  ],
});
