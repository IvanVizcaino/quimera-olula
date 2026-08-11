import { applyBunch, shortcutsBunch, shortcutsState } from "quimera/lib";

import data from "./Curso.ctrl.yaml";

export const state = parent => ({
  ...parent,
  ...shortcutsState(data.shortcuts),
  ...data.state,
});

export const bunch = parent => {
  const parentConShortCuts = {
    ...parent,
    ...shortcutsBunch(data.shortcuts),
    onInit: [
      {
        type: "setStateKey",
        plug: ({ initCurso }) => ({
          path: "lineaseventos.filter.and",
          value: [["codcurso", "eq", `${initCurso?.codCurso}`]],
        }),
      },
      {
        type: "setStateKey",
        plug: ({ initCurso }) => ({
          path: "contactosevento.filter.and",
          value: [["codevento", "eq", `${initCurso?.codCurso}`]],
        }),
      },
      {
        type: "setStateKey",
        plug: ({ initCurso }) => ({
          path: "responsablesvento.filter.and",
          value: [["codevento", "eq", `${initCurso?.codCurso}`]],
        }),
      },
      {
        type: "grape",
        name: "getLineaseventos",
      },
      {
        type: "grape",
        name: "getContactosevento",
      },
      {
        type: "grape",
        name: "getResponsablesvento",
      },
    ],
    // onCrearCampaniaClicked: [
    //   {
    //     type: "userConfirm",
    //     question: () => ({
    //       titulo: "",
    //       cuerpo: "Se va a crear una campaña de marketing asociada al curso",
    //       textoSi: "CREAR",
    //       textoNo: "CANCELAR",
    //     }),
    //     onConfirm: "onCrearCampaniaClickConfirmed",
    //   },
    // ],
    onRemoveContactoEvento: [
      {
        type: "userConfirm",
        question: () => ({
          titulo: "¿Remover contacto?",
          cuerpo:
            "Se va a eliminar el contacto del curso(Esto no afectara si hay campaña asociada)",
          textoSi: "REMOVER",
          textoNo: "CANCELAR",
        }),
        onConfirm: "onRemoveContactoEventoConfirmed",
      },
    ],
    onRemoveResponsableEvento: [
      {
        type: "userConfirm",
        question: () => ({
          titulo: "¿Remover responsable?",
          cuerpo:
            "Se va a eliminar este responsable de curso.",
          textoSi: "REMOVER",
          textoNo: "CANCELAR",
        }),
        onConfirm: "onRemoveResponsableEventoConfirmed",
      },
    ],
    onAnadirContactoClicked: [
      {
        type: "setStateKey",
        plug: () => ({ path: "modalAnadirContactoVisible", value: true }),
      },
    ],
    onCrearNuevoContactoClicked: [
      {
        type: "setStateKey",
        plug: () => ({ path: "modalCrearContactoVisible", value: true }),
      },
    ],
    onCerrarCrearContacto: [
      // {
      //   condition: ({ response }) => !!response?.pk,
      //   type: "grape",
      //   name: "setStateKey",
      //   plug: ({ response }) => ({ field: "contactoAnadir", value: response.pk }),
      // },
      {
        condition: ({ response }) => !!response?.pk,
        type: "grape",
        name: "saveContactoCreado",
        plug: payload => ({
          ...payload,
          contactoAnadir: payload.response.pk,
          tipoCreacion: "Creacion",
        }),
      },
      {
        condition: ({ response }) => !response?.pk,
        type: "setStateKey",
        plug: () => ({ path: "modalCrearContactoVisible", value: false }),
      },
    ],
    onCerrarAnadirContacto: [
      {
        type: "setStateKey",
        plug: () => ({ path: "modalAnadirContactoVisible", value: false }),
      },
    ],
    onAnadirResponsableClicked: [
      {
        type: "setStateKey",
        plug: () => ({ path: "modalAnadirResponsableVisible", value: true }),
      },
    ],
    onCerrarAnadirResponsable: [
      {
        type: "setStateKey",
        plug: () => ({ path: "modalAnadirResponsableVisible", value: false }),
      },
    ],
  };

  return {
    ...parentConShortCuts,
    ...applyBunch(data.bunch, parentConShortCuts),
  };
};
