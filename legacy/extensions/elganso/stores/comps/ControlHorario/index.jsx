import "./ControlHorario.style.scss";

import { DataGrid } from "@mui/x-data-grid";
import { Button, Icon } from "@quimera/comps";
import PropTypes from "prop-types";
import { useStateValue } from "quimera";
import { useEffect, useState } from "react";

import { LoadingGif } from "../../comps";

function tramoToSeconds(fechaDesde, horaDesde, fechaHasta = null, horaHasta = null) {
  const dateInicio = `${fechaDesde}T${horaDesde}`;

  let dateFin = new Date();
  if (fechaHasta && horaHasta) {
    dateFin = `${fechaHasta}T${horaHasta}`;
  }

  const diff = Date.parse(dateFin) - Date.parse(dateInicio);

  return Math.floor(diff / 1000);
}

function secondsToTime(seconds) {
  const horas = parseInt(seconds / 3600, 10);
  const minutos = parseInt((seconds % 3600) / 60, 10);
  const segundos = parseInt((seconds % 3600) % 60, 10);

  const horasMinutos = `${horas}:${minutos < 10 ? `0${minutos}` : minutos}`;

  return `${horasMinutos}:${segundos < 10 ? `0${segundos}` : segundos}`;
}

function ControlHorario() {
  const [state, dispatch] = useStateValue();
  const { tramosJornada, tramoActivo, isLoading } = state;

  const [totalTramos, setTotalTramos] = useState(0);
  const [tramoActual, setTramoActual] = useState(0);

  const getTime = (t = 0) => {
    const { tramoActivo } = state;
    let incTiempo = 0;

    if (tramoActivo) {
      incTiempo = tramoToSeconds(tramoActivo.fechadesde, tramoActivo.horadesde);
      setTramoActual(incTiempo);
    }

    setTotalTramos(t + incTiempo);
  };

  useEffect(() => {
    dispatch({
      type: "init",
    });
  }, [dispatch]);

  useEffect(() => {
    const { tramosJornada, tramoActivo } = state;
    let tTramo = 0;
    if (tramosJornada.length > 0) {
      tramosJornada.map(tramo => {
        tTramo += tramo.tiempo;

        return null;
      });
    }
    setTotalTramos(tTramo);
    if (tramoActivo) {
      const interval = setInterval(() => getTime(tTramo), 1000);

      return () => clearInterval(interval);
    }
    setTramoActual(0);
  }, [state]);

  const renderTramos = () => {
    const columns = [
      { field: "tipo", headerName: "TIPO", flex: 1 },
      { field: "fechadesde", headerName: "FECHA", flex: 1 },
      { field: "horadesde", headerName: "HORA DESDE", flex: 1 },
      { field: "horahasta", headerName: "HORA HASTA", flex: 1 },
      { field: "tiempoFormateado", headerName: "TIEMPO", flex: 1 },
    ];
    const tramosTiempoFormat = [];
    tramosJornada.map(tramo => {
      const tramoFormat = Object.assign({}, tramo);
      tramoFormat["tiempoFormateado"] = secondsToTime(tramo.tiempo);
      tramosTiempoFormat.push(tramoFormat);

      return null;
    });

    return (
      <DataGrid
        rows={tramosTiempoFormat}
        disableColumnFilter
        disableColumnSelector
        disableDensitySelector
        disableColumnMenu
        disableRowSelectionOnClick
        columns={columns}
        getRowId={row => row.idtramo}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            printOptions: { disableToolbarButton: true },
            csvOptions: { disableToolbarButton: true },
          }
        }}
        localeText={{
          noRowsLabel: "No hay tramos",
          toolbarQuickFilterPlaceholder: "Buscar...",
          paginationRowsPerPage: "Líneas por página",
          paginationDisplayedRows: ({ from, to, count }) =>
            `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`,
          footerRowSelected: (count) =>
            count !== 1
              ? `${count} filas seleccionadas`
              : `${count} fila seleccionada`,
        }}
      />
    );
  };

  // BOTONES DE ACCIONES
  const clickPlay = () => {
    const { tramoActivo } = state;
    let iTramo = null;
    if (tramoActivo) {
      iTramo = tramoActivo.idtramo;
    }

    dispatch({
      type: "playTramo",
      payload: {
        hoy: new Date().toISOString().substring(0, 10),
        tipo: "Trabajo",
        idtramo: iTramo,
      },
    });
  };

  const clickPause = () => {
    const {
      tramoActivo: { idtramo },
    } = state;

    dispatch({
      type: "pauseTramo",
      payload: {
        hoy: new Date().toISOString().substring(0, 10),
        tipo: "Pausa",
        idtramo,
      },
    });
  };

  const clickStop = () => {
    dispatch({
      type: "stopTramo",
      payload: {
        idtramo: tramoActivo["idtramo"],
        idjornada: tramoActivo["idjornada"],
        fechadesde: tramoActivo["fechadesde"],
      },
    });
  };

  const renderLoading = () => {
    if (isLoading) {
      return (
        <div className="loading-wrapper">
          <LoadingGif />
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <div id="ControlHorario" className="controlHorario">
        <Button
          id="playButton"
          className={
            !tramoActivo || tramoActivo.tipo === "Pausa"
              ? "buttonControl buttonControl-Play"
              : "buttonControl buttonControl-PlayInactive"
          }
          onClick={!tramoActivo || tramoActivo.tipo === "Pausa" ? () => clickPlay() : null}
        >
          <Icon fontSize="large">play_arrow</Icon>
        </Button>
        <Button
          id="pauseButton"
          className={
            tramoActivo && tramoActivo.tipo === "Trabajo"
              ? "buttonControl buttonControl-Pause"
              : "buttonControl buttonControl-PauseInactive"
          }
          onClick={tramoActivo && tramoActivo.tipo === "Trabajo" ? () => clickPause() : null}
        >
          <Icon fontSize="large">pause</Icon>
        </Button>
        <Button
          id="stopButton"
          className={
            tramoActivo
              ? "buttonControl buttonControl-Stop"
              : "buttonControl buttonControl-StopInactive"
          }
          onClick={tramoActivo ? () => clickStop() : null}
        >
          <Icon fontSize="large">stop</Icon>
        </Button>
        <div className="totalTiempo-Wrapper">
          <div className="totalTiempo">TOTAL JORNADA: {secondsToTime(totalTramos)}</div>
          <div className="totalTiempo">TRAMO ACTUAL: {secondsToTime(tramoActual)}</div>
        </div>
      </div>
      {tramosJornada.length > 0 ? renderTramos() : null}
      {renderLoading()}
    </>
  );
}

ControlHorario.propTypes = {
  estilos: PropTypes.object,
};
ControlHorario.defaultProps = {};

export default ControlHorario;
