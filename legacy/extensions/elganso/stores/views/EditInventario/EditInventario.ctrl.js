import { getSchemas, util } from "quimera";
import { applyBunch, shortcutsBunch, shortcutsState } from "quimera/lib";

import data from "./EditInventario.ctrl.yaml";

export const state = parent => ({
  ...parent,
  ...shortcutsState(data.shortcuts),
  ...data.state,
  articulos: null,
  barcode: null,
  idSincroActual: null,
  inventario: null,
  lineasInventarios: [],
  qtyAgregar: 1,
  qtyModificada: 0,
  modalEditVisible: false,
  lineaSeleccionada: null,
  inventariosDbIndexState: null,
  setInventariosDbIndexState: null,
  fecha: util.today(),
  hora: util.now(),
});

export const bunch = parent => {
  const parentConShortCuts = {
    ...parent,
    ...shortcutsBunch(data.shortcuts),
    setIndexDb: [
      {
        type: "setStateKeys",
        plug: payload => {
          const { inventariosDbIndex, setInventariosDbIndex } = payload;

          return {
            keys: {
              inventariosDbIndexState: inventariosDbIndex,
              setInventariosDbIndexState: setInventariosDbIndex,
            },
          };
        },
      },
    ],
    getInventario: [
      {
        type: "setStateKeys",
        plug: payload => {
          const { idsincroFiltro, inventariosDbIndex } = payload;

          const inventarioSeleccionado = inventariosDbIndex.find(
            inventario => inventario.idsincro === idsincroFiltro,
          );

          return {
            keys: {
              inventario: inventarioSeleccionado,
              inventariosDbIndexState: inventariosDbIndex,
            },
          };
        },
      },
      {
        type: "grape",
        name: "getLineasInventario",
      },
    ],
    setLineasInventarios: [
      {
        type: "setStateKeys",
        plug: (payload, state) => {
          const {
            idSincroActual,
            inventariosDbIndexState,
            lineasInventarios,
            setInventariosDbIndexState,
          } = state;
          const { inventariosDbIndex, response } = payload;
          let invActual = null;

          if (inventariosDbIndex) {
            invActual = inventariosDbIndex.find(inv => inv.idsincro === idSincroActual);
          } else {
            invActual = inventariosDbIndexState.find(inv => inv.idsincro === idSincroActual);
          }
          let newLineas = [];

          if (invActual.lineasModificadas) {
            newLineas = response.data.map(linea => {
              const resul = Object.values(invActual.lineasModificadas).find(
                lmod => linea.id === lmod.id,
              );

              if (resul) {
                return resul;
              }

              return linea;
            });

            return {
              keys: {
                lineasInventarios: newLineas,
              },
            };
          }

          if (lineasInventarios.length !== 0 && lineasInventarios.length !== response.data.length) {
            const ids = [];
            // const newLineas = [];
            const newLineas = {};

            // Sacamos los ids de las lineas que ya teníamos
            lineasInventarios.forEach(linea => {
              ids.push(linea.id);
            });

            // Comparamos las lineas obtenidas con las que ya teníamos para detectar nuevas lineas
            response.data.forEach(linea => {
              if (!ids.includes(linea.id)) {
                // newLineas.splice(linea.id, 0, linea);
                newLineas[linea.id] = linea;
              }
            });

            // Guardamos las lineas obtenidas en la bbdd indexada
            invActual.lineasModificadas = newLineas;

            const newInv = inventariosDbIndexState.map(inv =>
              inv.idsincro !== idSincroActual ? inv : invActual,
            );

            setInventariosDbIndexState(newInv);
          }

          return {
            keys: {
              lineasInventarios: response.data,
            },
          };
        },
      },
    ],
    getArticulos: [
      {
        // Si no tenemos datos en la bbdd indexada los pedimos al servidor
        condition: payload => !payload.articulosDbIndex || payload.articulosDbIndex.length === 0,
        type: "get",
        schema: getSchemas().articulos,
        success: "setArticulos",
      },
      {
        // Si ya teníamos datos en la bbdd indexada los guardamos en el state
        condition: payload => payload.articulosDbIndex && payload.articulosDbIndex.length > 0,
        type: "setStateKeys",
        plug: payload => {
          const { articulosDbIndex } = payload;

          return {
            keys: {
              articulos: articulosDbIndex,
            },
          };
        },
      },
    ],
    setArticulos: [
      {
        type: "setStateKeys",
        plug: payload => {
          const { setArticulosDbIndex } = payload;

          // Venimos del get, guardamos articulos en la bbdd indexada
          setArticulosDbIndex(payload.response.data);

          return {
            keys: {
              articulos: payload.response.data,
            },
          };
        },
      },
    ],
    updateQtyAgregar: [
      {
        type: "setStateKey",
        plug: ({ newQty = 1 }) => ({
          path: "qtyAgregar",
          value: newQty,
        }),
      },
    ],
    updateQtyModificada: [
      {
        type: "setStateKey",
        plug: ({ newQty = 0 }) => {
          if (newQty < 0) {
            return {
              path: "qtyModificada",
              value: 0,
            };
          }

          return {
            path: "qtyModificada",
            value: newQty,
          };
        },
      },
    ],
    onClickAddNewLinea: [
      // Actualizamos fecha y hora en este momento ya que esta guardada la del inicio de apertura del componente
      {
        type: "setStateKeys",
        plug: () => ({
          keys: {
            fecha: util.today(),
            hora: util.now(),
          },
        }),
      },
      {
        type: "grape",
        name: "createNewLinea",
      },
    ],
    updateLineaIndexded: [
      {
        type: "setStateKeys",
        plug: (payload, { lineasInventarios }) => {
          const { lineaModificada } = payload;

          const newLineas = lineasInventarios.map(linea =>
            linea.id !== lineaModificada.id ? linea : lineaModificada,
          );

          return {
            keys: {
              lineasInventarios: newLineas,
            },
          };
        },
      },
      {
        type: "grape",
        name: "onCerrarModalEditLinea",
      },
      {
        type: "grape",
        name: "showLineaModificada",
      },
    ],
    onDeleteLineaInventarioClicked: [
      {
        type: "userConfirm",
        question: ({ referenciaLinea }) => ({
          titulo: "¿Borrar Linea?",
          cuerpo: `La línea con referencia ${referenciaLinea} se eliminará de la lista de tramos definitivamente`,
          textoSi: "CONFIRMAR",
          textoNo: "CANCELAR",
        }),
        onConfirm: "deleteLineaInventario",
      },
    ],
    deleteLinea: [
      {
        type: "setStateKeys",
        plug: ({ idLinea }, { lineasInventarios, inventario }) => {
          const newLineas = lineasInventarios.filter(inv => inv.id !== idLinea);

          // Actualizamos las lineas modificadas en el inventario
          let nuevasLineasModificadas = [];

          if (inventario.lineasModificadas) {
            // Comprobamos que sea un objeto o un array para tratarlo correctamente
            if (inventario.lineasModificadas.length === undefined) {
              nuevasLineasModificadas = Object.values(inventario.lineasModificadas).filter(
                lm => lm.id !== idLinea,
              );
            } else {
              nuevasLineasModificadas = inventario.lineasModificadas.filter(lm => lm.id !== idLinea);
            }
          }

          // Si quedan lineas modificadas las dejamos, si no borramos la propiedad
          if (nuevasLineasModificadas.length > 0) {
            inventario.lineasModificadas = nuevasLineasModificadas;
          } else {
            delete inventario.lineasModificadas;
          }

          return {
            keys: {
              lineasInventarios: newLineas,
              inventario,
            },
          };
        },
      },
    ],
    onModificarLinea: [
      {
        type: "setStateKeys",
        plug: (_, { lineasInventarios, qtyModificada, lineaSeleccionada }) => {
          const newLineas = lineasInventarios.map(linea =>
            linea.id !== lineaSeleccionada.id ? linea : { ...linea, cantidadfin: qtyModificada },
          );

          return {
            keys: {
              lineasInventarios: newLineas,
            },
          };
        },
      },
      {
        type: "grape",
        name: "onCerrarModalEditLinea",
      },
      {
        type: "grape",
        name: "showLineaModificada",
      },
    ],
    // marcarLineaRevisada: [
    //   {
    //     type: "setStateKeys",
    //     plug: payload => {
    //       const { linea } = payload;

    //       return {
    //         keys: {
    //           lineaSeleccionada: null,
    //         },
    //       };
    //     },
    //   },
    // ],
  };

  return {
    ...parentConShortCuts,
    ...applyBunch(data.bunch, parentConShortCuts),
  };
};
