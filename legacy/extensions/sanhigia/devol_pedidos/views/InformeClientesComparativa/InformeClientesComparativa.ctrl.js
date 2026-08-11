import { getSchemas } from "quimera";
// import { navigate } from 'quimera'

export const state = parent => ({
  ...parent,
  cliComparativa: [],
  ordenCliComparativa: {
    field: "codcliente",
    direction: "ASC",
  },
  paginaCli: {
    limit: 20,
    next: null,
    previous: null,
  },
  ordenArtComparativa: {
    field: "referencia",
    direction: "ASC",
  },
  paginaArt: {
    limit: 25,
    next: null,
    previous: null,
  },
  emailsSeleccionados: {},
  listaEmails: "",
  abrirMostrarEmails: false,
  soloSeleccionados: false,
  years: [],
  anyoUno: null,
  anyoDos: null,
  trimestre: null,
  idCliente: null,
  artiComparativa: [],
  estadoVista: "limpio",
});

export const bunch = parent => ({
  ...parent,
  init: [
    {
      type: "setStateKeys",
      plug: ({ idClienteProp }) => {
        const anyoActual = new Date().getFullYear();
        const yearsAux = [];

        for (let i = anyoActual; i >= anyoActual - 10; i--) {
          yearsAux.push({ key: i, value: i.toString() });
        }
        yearsAux.sort((a, b) => a.key - b.key);

        return {
          keys: {
            years: yearsAux,
            idCliente: idClienteProp,
          },
        };
      },
    },
    {
      condition: ({ idClienteProp }) => idClienteProp,
      type: "grape",
      name: "cargarDatosCliente",
    },
  ],
  cargarClientes: [
    // {
    //   type: "setStateKey",
    //   plug: () => ({ path: "estadoVista", value: "lanzando" }),
    // },
    {
      type: "function",
      function: ({ page }, { paginaCli }) => {
        let nuevaPagina = { limit: paginaCli.limit };
        let limpia = true;
        if (page === "next") {
          limpia = false;
          nuevaPagina = {
            limit: paginaCli.limit,
            next: paginaCli.next,
          };
        } else if (page === "previous") {
          nuevaPagina = {
            limit: paginaCli.limit,
            previous: paginaCli.previous,
          };
        } else if (page === "first") {
          nuevaPagina = {
            limit: paginaCli.limit,
          };
        }

        return { limpiaListado: limpia, paginaCli: nuevaPagina };
      },
      success: [
        {
          condition: ({ response }) => response.limpiaListado,
          type: "setStateKey",
          plug: () => ({ path: "cliComparativa", value: [] }),
        },
        {
          type: "get",
          schema: () => getSchemas().clientesComparativa,
          page: ({ response }) => response.paginaCli,
          order: (_, { ordenCliComparativa }) => ordenCliComparativa,
          params: (_, { anyoUno, anyoDos, trimestre }) => ({ anyoUno, anyoDos, trimestre }),
          success: "onDatosRecibidos",
        },
      ],
    },
  ],
  onCerrarMostrarEmails: [
    {
      type: "setStateKey",
      plug: () => ({ path: "abrirMostrarEmails", value: false }),
    },
  ],
  onCopiarAClipboardClicked: [
    {
      type: "function",
      function: (_, { listaEmails }) => {
        navigator.clipboard.writeText(listaEmails);
      },
      success: [
        {
          type: "showMessage",
          plug: () => ({ mensaje: `Copiado el listado de emails.`, tipoMensaje: "success" }),
        },
      ],
    },
  ],
  onDatosRecibidos: [
    {
      // log: ({ response }, { cliComparativa }) => ["mimensaje280", cliComparativa.length, response.data.length],
      condition: ({ response }, { cliComparativa }) => cliComparativa.length === 0,
      type: "setStateKey",
      plug: ({ response }, { cliComparativa }) => ({
        path: "estadoVista",
        value:
          cliComparativa.length > 0 || response.data.length > 0
            ? "lanzadoConResultados"
            : "lanzadoSinResultados",
      }),
    },
    {
      // log: ({ response }, { cliComparativa }) => ["mimensaje290", cliComparativa.length, response.data.length],
      type: "setStateKeys",
      plug: ({ response }, { cliComparativa }) => ({
        keys: {
          cliComparativa: [...cliComparativa, ...response.data],
          paginaCli: response.page,
        },
      }),
    },
  ],
  onLanzarInformeClicked: [
    {
      type: "grape",
      name: "limpiarTabla",
    },
    {
      type: "grape",
      name: "cargarClientes",
    },
  ],
  onLimpiarDatosClicked: [
    {
      type: "grape",
      name: "limpiarTabla",
    },
    {
      type: "grape",
      name: "limpiarFormulario",
    },
  ],
  limpiarTabla: [
    {
      type: "setStateKeys",
      plug: () => ({
        keys: {
          cliComparativa: [],
          ordenCliComparativa: { field: "codcliente", direction: "ASC" },
          paginaCli: { limit: 20, next: null, previous: null },
          estadoVista: "limpio",
          emailsSeleccionados: {},
          listaEmails: "",
          abrirMostrarEmails: false,
          soloSeleccionados: false,
        },
      }),
    },
  ],
  limpiarFormulario: [
    {
      type: "setStateKeys",
      plug: () => ({
        keys: {
          anyoUno: null,
          anyoDos: null,
          trimestre: null,
        },
      }),
    },
  ],
  onAnyoUnoChanged: [
    {
      type: "setStateKeys",
      plug: ({ value }) => ({
        keys: {
          anyoUno: value,
          estadoVista: "limpio",
        },
      }),
    },
  ],
  onAnyoDosChanged: [
    {
      type: "setStateKeys",
      plug: ({ value }) => ({
        keys: {
          anyoDos: value,
          estadoVista: "limpio",
        },
      }),
    },
  ],
  onTrimestreChanged: [
    {
      type: "setStateKeys",
      plug: ({ value }) => ({
        keys: {
          trimestre: value,
          estadoVista: "limpio",
        },
      }),
    },
  ],
  onMarcarSoloSeleccionadosClicked: [
    {
      type: "setStateKey",
      plug: (_, { soloSeleccionados }) => ({
        path: "soloSeleccionados",
        value: !soloSeleccionados,
      }),
    },
  ],
  onMostrarSiguienteClicked: [
    {
      type: "grape",
      name: "cargarClientes",
      plug: () => ({ page: "next" }),
    },
  ],
  onMostrarSiguienteArtClicked: [
    {
      type: "grape",
      name: "cargarDatosCliente",
      plug: () => ({ page: "next" }),
    },
  ],
  onObtenerEmailsClicked: [
    {
      type: "setStateKey",
      plug: ({ data }, { emailsSeleccionados }) => {
        const listaEmailsAux = [];
        for (const email in emailsSeleccionados) {
          listaEmailsAux.push(emailsSeleccionados[email]);
        }

        return { path: "listaEmails", value: listaEmailsAux.join(",\n") };
      },
    },
    {
      type: "setStateKey",
      plug: () => ({ path: "abrirMostrarEmails", value: true }),
    },
  ],
  onSeleccionarClienteClicked: [
    {
      type: "setStateKeys",
      plug: ({ data }, { cliComparativa, emailsSeleccionados }) => {
        const cliComparativaAux = cliComparativa;
        const listaEmailsAux = emailsSeleccionados;
        for (const cliente of cliComparativaAux) {
          if (cliente.codCliente === data.codCliente) {
            cliente.seleccionada = cliente.seleccionada ? false : true;
            if (cliente.email) {
              if (cliente.codCliente in listaEmailsAux) {
                delete listaEmailsAux[cliente.codCliente];
              } else {
                listaEmailsAux[cliente.codCliente] = cliente.email;
              }
            }
          }
        }

        return {
          keys: {
            cliComparativa: cliComparativaAux,
            emailsSeleccionados: listaEmailsAux,
          },
        };
      },
    },
  ],
  onTdbClientesComparativaColumnClicked: [
    {
      condition: (_, { soloSeleccionados }) => !soloSeleccionados,
      type: "setStateKey",
      plug: ({ data }, { ordenCliComparativa }) => ({
        path: "ordenCliComparativa",
        value: {
          field: data.order,
          direction:
            data.order === ordenCliComparativa.field
              ? ordenCliComparativa.direction === "DESC"
                ? "ASC"
                : "DESC"
              : "ASC",
        },
      }),
    },
    {
      condition: (payload, { soloSeleccionados }) => !soloSeleccionados && payload.data.order,
      type: "grape",
      name: "cargarClientes",
    },
  ],
  onTdbClientesComparativaRowClicked: [
    {
      type: "setStateKey",
      plug: ({ codCliente }) => ({ path: "idCliente", value: codCliente }),
    },
    {
      type: "grape",
      name: "cargarDatosCliente",
    },
  ],
  onCerrarComparativaArticulos: [
    {
      type: "setStateKeys",
      plug: () => ({
        keys: {
          idCliente: null,
          artiComparativa: [],
          ordenArtComparativa: { field: "referencia", direction: "ASC" },
          paginaArt: { limit: 25, next: null, previous: null },
        },
      }),
    },
  ],
  onTdbArticulosComparativaColumnClicked: [
    {
      type: "setStateKey",
      plug: ({ data }, { ordenArtComparativa }) => ({
        path: "ordenArtComparativa",
        value: {
          field: data.order,
          direction:
            data.order === ordenArtComparativa.field
              ? ordenArtComparativa.direction === "DESC"
                ? "ASC"
                : "DESC"
              : "ASC",
        },
      }),
    },
    {
      type: "grape",
      name: "cargarDatosCliente",
    },
  ],
  cargarDatosCliente: [
    {
      type: "function",
      function: ({ page }, { paginaArt }) => {
        let nuevaPagina = { limit: paginaArt.limit };
        let limpia = true;
        if (page === "next") {
          limpia = false;
          nuevaPagina = {
            limit: paginaArt.limit,
            next: paginaArt.next,
          };
        } else if (page === "previous") {
          nuevaPagina = {
            limit: paginaArt.limit,
            previous: paginaArt.previous,
          };
        } else if (page === "first") {
          nuevaPagina = {
            limit: paginaArt.limit,
          };
        }

        return { limpiaListado: limpia, paginaArt: nuevaPagina };
      },
      success: [
        {
          condition: ({ response }) => response.limpiaListado,
          type: "setStateKey",
          plug: () => ({ path: "artiComparativa", value: [] }),
        },
        {
          type: "get",
          schema: () => getSchemas().articulosClientesComparativa,
          // id: ({ idCliente }) => idCliente,
          page: ({ response }) => response.paginaArt,
          order: (_, { ordenArtComparativa }) => ordenArtComparativa,
          params: (_, { anyoUno, anyoDos, trimestre, idCliente }) => ({
            anyoUno,
            anyoDos,
            trimestre,
            idCliente,
          }),
          success: "onDatosClienteRecibidos",
        },
      ],
    },
  ],
  onDatosClienteRecibidos: [
    {
      // log: ({ response }, { cliComparativa }) => ["mimensaje290", response],
      type: "setStateKeys",
      plug: ({ response }, { artiComparativa }) => ({
        keys: {
          artiComparativa: [...artiComparativa, ...response.data],
          paginaArt: response.page,
        },
      }),
    },
  ],
});
