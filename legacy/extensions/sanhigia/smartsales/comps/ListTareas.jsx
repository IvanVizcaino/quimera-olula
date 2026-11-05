import { Typography } from "@quimera/comps";
import { navigate, useStateValue, util } from "quimera";

import { List } from "./";

const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

const showMessage = element => {
  util.appDispatch({
    type: "mostrarMensaje",
    payload: {
      mensaje: `El contacto no tiene un ${element} asociado`,
      tipoMensaje: "warning",
    },
  });
};

const tipos = {
  Llamada: {
    icon: "phone_enabled",
    class: "error",
  },
  Email: {
    icon: "mail",
    class: "success",
  },
  Whatsapp: {
    icon: "whatsapp",
    class: "success_alt",
  },
  Cita: {
    icon: "groups",
    class: "info",
  },
};

const getAdornment = tipo => tipos[tipo]?.icon ?? tipos.Llamada.icon;
const getAdornmentClass = tipo => tipos[tipo]?.class ?? tipos.Llamada.class;

export default function ListTareas({ tareas }) {
  const [, dispatch] = useStateValue();

  if (!tareas?.idList?.length) {
    return <Typography variant="subtitle1">No hay tareas pendientes</Typography>;
  }

  const urlOnClicked = _tarea => {
    const urlOnClicked = _tarea.urlOnClicked
      ? `${_tarea.urlOnClicked}/tarea/${_tarea.id}`
      : `/ss/tarea/${_tarea.id}`;

    return urlOnClicked;
  };

  const tareaActions = _tarea =>
    [
      {
        name: "Llamada",
        trigger: () =>
          _tarea?.telefonoContacto
            ? (window.location.href = `tel://+34${_tarea?.telefonoContacto}`)
            : showMessage("teléfono"),
        class: "error",
      },
      {
        name: "Email",
        trigger: () =>
          _tarea?.emailContacto
            ? (window.location.href = `mailto:${_tarea?.emailContacto}`)
            : showMessage("email"),
        class: "success",
      },
      {
        name: "Whatsapp",
        trigger: () =>
          _tarea?.telefonoContacto
            ? window.open(`https://wa.me/34${_tarea?.telefonoContacto}`, "_blank")
            : showMessage("teléfono"),
        class: "success_alt",
      },
    ].filter(action => action.name === _tarea.tipo);

  return (
    <List
      data={tareas?.idList?.map(idTarea => {
        const _tarea = tareas?.dict?.[idTarea];

        return {
          id: _tarea.idTarea,
          text: _tarea.titulo,
          auxData1: _tarea.fecha.split("-")[2],
          auxData1ud: meses[parseInt(_tarea.fecha.split("-")[1]) - 1],
          auxData2: _tarea.hora,
          auxData2ud: "h.",
          adornment: getAdornment(_tarea?.tipo),
          adornmentClass: getAdornmentClass(_tarea?.tipo),
          finished: !!_tarea.completada,
          tipo: _tarea.tipo,
          telefonoContacto: _tarea.telefonoContacto,
          emailContacto: _tarea.emailContacto,
          urlOnClicked: tareas.urlOnClicked,
        };
      })}
      actions={tareaActions}
      onClick={_tarea => navigate(urlOnClicked(_tarea))}
    />
  );
}
