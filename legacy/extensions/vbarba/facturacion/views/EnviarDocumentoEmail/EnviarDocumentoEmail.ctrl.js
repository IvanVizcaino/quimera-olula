import { util } from "quimera";
import { applyBunch, shortcutsBunch, shortcutsState } from "quimera/lib";

import data from "./EnviarDocumentoEmail.ctrl.yaml";

export const state = parent => ({
  ...parent,
  ...shortcutsState(data.shortcuts),
  ...data.state,
  firmaAlbaran: {
    codContacto: "",
    firmadopor: "",
    cifnif: "",
    puesto: util.getUser()?.user,
    fecha: util.today(),
    hora: util.now(),
  },
});

export const bunch = parent => {
  const parentConShortCuts = {
    ...parent,
    ...shortcutsBunch(data.shortcuts),
    handleDragEnd: [
      {
        condition: ({ result }) =>
          result.destination !== null && result.destination.droppableId !== "Disponible",
        type: "grape",
        name: "añadirDesdeDisponibles",
      },
    ],
    añadirDesdeDisponibles: [
      {
        type: "setStateKey",
        plug: ({ result }, state) => {
          if (!result.destination) {
            return;
          }
          const { destination } = result;
          const listaDestino = `dir${destination.droppableId}`;
          const auxArray = [];
          for (const item of state[listaDestino]) {
            auxArray.push(item);
          }
          auxArray.splice(destination.index, 0, result.draggableId);

          return { path: listaDestino, value: auxArray };
        },
      },
      {
        type: "setStateKey",
        plug: ({ result }, state) => {
          const { source } = result;
          const listaOrigen = `dir${source.droppableId}`;
          const auxArray = [];
          for (const item of state[listaOrigen]) {
            auxArray.push(item);
          }
          auxArray.splice(source.index, 1);

          return { path: listaOrigen, value: auxArray };
        },
      },
    ],
    onQuitarRemitenteClicked: [
      {
        type: "setStateKey",
        plug: ({ index, tipoEnvio }, state) => {
          const listaOrigen = `dir${tipoEnvio}`;
          const auxArray = [];
          for (const item of state[listaOrigen]) {
            auxArray.push(item);
          }
          auxArray.splice(index, 1);

          return { path: listaOrigen, value: auxArray };
        },
      },
      {
        type: "setStateKey",
        plug: ({ emailDir }, { dirDisponible }) => {
          const auxArray = [];
          for (const item of dirDisponible) {
            auxArray.push(item);
          }
          auxArray.splice(dirDisponible.length, 0, emailDir);

          return { path: "dirDisponible", value: auxArray };
        },
      },
    ],
    mostrarErrorEnvioEmail: [
      {
        condition: ({ response }) => response,
        type: "showMessage",
        plug: ({ response }) => ({
          mensaje: response,
          tipoMensaje: "error",
        }),
      },
      {
        condition: ({ response }) => !response,
        type: "showMessage",
        plug: () => ({
          mensaje: "Error al enviar correo",
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
