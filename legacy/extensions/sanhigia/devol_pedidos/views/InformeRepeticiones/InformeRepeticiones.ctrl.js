import { util } from "quimera";
import { API } from "quimera/lib";

export const state = parent => ({
  ...parent,
  clientes: [],
  referencia: null,
  fechaDesde: null,
  fechaHasta: null,
  intervaloFecha: null,
  intervaloDias: null,
  articulo: "",
  clientesNoRepetidos: {},
  dispatch: null,
});

export const bunch = parent => ({
  ...parent,
  onInit: [
    {
      type: "setStateKeys",
      plug: payload => ({
        keys: {
          ...payload,
        },
      }),
    },
  ],
  onCargarDatosClicked: [
    {
      type: "function",
      function: (_p, { referencia, fechaDesde, fechaHasta, intervaloDias, dispatch }) => {
        const codAgente = util.getUser().codagente;
        const grupo = util.getUser().grupo;

        API("i_sh_repeticiones_venta")
          .get()
          .filter({
            referencia,
            fechaDesde,
            fechaHasta,
            intervaloDias,
            codagente: codAgente,
            grupo,
          })
          .go("onDatosRecibidos", dispatch);
        // clientes: payload.data,
        // clientesTotal: payload.data.length

        API("i_sh_repeticiones_venta")
          .get("-static-", "get_clientes_no_repetidos")
          .filter({
            referencia,
            fechaDesde,
            fechaHasta,
            codagente: codAgente,
            grupo,
          })
          .go("onDatosClientesNoRepetidos", dispatch);
        // clientesNoRepetidos: payload.data[0]
      },
    },
  ],
  onDatosRecibidos: [
    {
      type: "setStateKeys",
      plug: ({ data }) => ({
        keys: {
          clientes: data,
          clientesTotal: data.length,
        },
      }),
    },
  ],
  onDatosClientesNoRepetidos: [
    {
      type: "setStateKeys",
      plug: ({ data }) => ({
        keys: {
          clientesNoRepetidos: data[0],
        },
      }),
    },
  ],
  onDameReportClicked: [
    {
      type: "function",
      function: (_p, { referencia, fechaDesde, fechaHasta, intervaloDias, dispatch }) => {
        const codAgente = util.getUser().codagente;
        const grupo = util.getUser().grupo;

        API("i_sh_repeticiones_venta/-static-/dameReport")
          .get()
          .filter({
            referencia,
            fechaDesde,
            fechaHasta,
            intervaloDias,
            codagente: codAgente,
            grupo,
          })
          .download("onFicheroRecibido", "informe_repeticiones.xlsx", dispatch);
        // .go('onFicheroRecibido', dispatch)
      },
    },
  ],
  onIntervaloFechaChanged: [
    {
      type: "setStateKey",
      plug: ({ value }) => ({ path: "intervaloFecha", value }),
    },
    {
      log: ({ value }) => ["VALOR ", value],
      condition: ({ value }) => !!value,
      type: "setStateKeys",
      plug: ({ value }) => ({
        keys: {
          fechaDesde: util.intervalos[value]?.desde(),
          fechaHasta: util.intervalos[value]?.hasta(),
        },
      }),
    },
  ],
});
