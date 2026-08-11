import "./PlanificadorSemanal.style.scss";

import { Field, Icon, IconButton } from "@quimera/comps";
import Quimera, { PropValidation, useStateValue } from "quimera";
import { useEffect, useState } from "react";

import { SemanaPlanificador } from "../../comps";

function PlanificadorSemanal() {
  const [state, dispatch] = useStateValue();
  const [inicioSemana, setInicioSemana] = useState(new Date());
  const [finSemana, setFinSemana] = useState(new Date());
  const [tiendaSeleccionada, setTiendaSeleccionada] = useState();
  const [agenteSeleccionado, setAgenteSeleccionado] = useState();

  useEffect(() => {
    const date = new Date();
    while (date.getDay() !== 1) {
      date.setDate(date.getDate() - 1);
    }
    setInicioSemana(new Date(date));
    date.setDate(date.getDate() + 6);
    setFinSemana(new Date(date));
    dispatch({
      type: "init",
    });
  }, [dispatch]);

  useEffect(() => {
    if (tiendaSeleccionada && inicioSemana) {
      dispatch({
        type: "onGetTramosBySemanaTienda",
        payload: {
          codtienda: tiendaSeleccionada,
          semana: new Date(inicioSemana).toISOString().substring(0, 10),
        },
      });
    }
  }, [inicioSemana, tiendaSeleccionada]);

  useEffect(() => {
    if (tiendaSeleccionada) {
      setAgenteSeleccionado(null);
      dispatch({
        type: "onGetAgentesTienda",
        payload: {
          codtienda: tiendaSeleccionada,
        },
      });
    }
  }, [tiendaSeleccionada]);

  const clickAnterior = () => {
    const date = new Date(inicioSemana);
    date.setDate(date.getDate() - 7);
    setInicioSemana(date);
    const dateFin = new Date(finSemana);
    dateFin.setDate(dateFin.getDate() - 7);
    setFinSemana(dateFin);
  };

  const clickSiguiente = () => {
    const date = new Date(inicioSemana);
    date.setDate(date.getDate() + 7);
    setInicioSemana(date);
    const dateFin = new Date(finSemana);
    dateFin.setDate(dateFin.getDate() + 7);
    setFinSemana(dateFin);
  };

  const getTiendas = () => {
    const { tiendas } = state;
    const aux = [];

    if (tiendas) {
      for (const [key, value] of Object.entries(tiendas)) {
        aux.push({
          key,
          value: key,
        });
      }
    }

    return aux;
  };

  const getAgentes = () => {
    const { agentes } = state;
    const aux = [];

    if (agentes) {
      for (const [key, value] of Object.entries(agentes)) {
        aux.push({
          key,
          value: value[key],
        });
      }
    }

    return aux;
  };

  const render = () => {
    const inicio = new Date(inicioSemana).toISOString().substring(0, 10);
    const fin = new Date(finSemana).toISOString().substring(0, 10);
    const tiendas = getTiendas();
    const agentesSelect = getAgentes();
    const { planificador } = state;

    if (!tiendas || tiendas.length === 0) {
      return (
        <div id="planificadorSemanal" className="page-container">
          <div className="tiendaNoSeleccionada">
            No tiene asignada ninguna tienda para planificar, consulte con soporte
          </div>
        </div>
      );
    }

    if (tiendas && tiendas.length === 1) {
      if (tiendaSeleccionada !== tiendas[0].key) {
        setTiendaSeleccionada(tiendas[0].key);
      }

      return (
        <div id="planificadorSemanal" className="page-container">
          <h2 className="main">Planificación {tiendaSeleccionada}</h2>

          <div className="container-title2">
            <div className="selectorAgenteWrapper">
              <div className="selectorAgente">
                <Field.Select
                  id="filtroAgente"
                  label="Agente"
                  options={agentesSelect}
                  getOptions={getAgentes}
                  onChange={e => {
                    if (e.target.value) {
                      setAgenteSeleccionado(e.target.value.key);
                    } else {
                      setAgenteSeleccionado(null);
                    }
                  }}
                  value={agenteSeleccionado}
                  fullWidth
                />
              </div>
            </div>
            <div className="selectorSemanal">
              <IconButton id="psButtonLeft" className="icon-button" onClick={clickAnterior}>
                <Icon>chevron_left</Icon>
              </IconButton>
              <span id="semana">
                {inicio} - {fin}
              </span>
              <IconButton id="psButtonRight" className="icon-button" onClick={clickSiguiente}>
                <Icon>chevron_right</Icon>
              </IconButton>
            </div>
          </div>
          {planificador && planificador.length > 0 ? (
            <SemanaPlanificador
              state={state}
              fechaInicio={inicioSemana}
              codtienda={tiendaSeleccionada}
              editable={true}
              agenteFiltro={agenteSeleccionado}
            />
          ) : null}
        </div>
      );
    }

    if (!tiendaSeleccionada) {
      return (
        <div id="planificadorSemanal" className="page-container">
          <h2 className="main">Planificador</h2>
          <div className="tiendaNoSeleccionada">*Por favor seleccione una tienda</div>
          <div className="selectorTiendaWrapper">
            <div className="selectorTienda">
              <Field.Select
                id="selectorTienda"
                label="Tiendas"
                options={tiendas}
                getOptions={getTiendas}
                onChange={e => {
                  if (e.target.value) {
                    setTiendaSeleccionada(e.target.value.key);
                  } else {
                    setTiendaSeleccionada(null);
                  }
                }}
                value={tiendaSeleccionada}
                fullWidth
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div id="planificadorSemanal" className="page-container">
        <h2 className="main">Planificación {tiendaSeleccionada}</h2>
        <div className="container-title2">
          <div className="selectorTiendaWrapperCabecera">
            <div className="selectorTienda">
              <Field.Select
                id="selectorTienda"
                label="Tiendas"
                options={tiendas}
                getOptions={getTiendas}
                onChange={e => {
                  if (e.target.value) {
                    setTiendaSeleccionada(e.target.value.key);
                  } else {
                    setTiendaSeleccionada(null);
                  }
                }}
                value={tiendaSeleccionada}
                fullWidth
              />
            </div>
          </div>

          <div className="selectorAgenteWrapper">
            <div className="selectorAgente">
              <Field.Select
                id="filtroAgente"
                label="Agente"
                options={agentesSelect}
                getOptions={getAgentes}
                onChange={e => {
                  if (e.target.value) {
                    setAgenteSeleccionado(e.target.value.key);
                  } else {
                    setAgenteSeleccionado(null);
                  }
                }}
                value={agenteSeleccionado}
                fullWidth
              />
            </div>
          </div>
          <div className="selectorSemanal">
            <IconButton id="psButtonLeft" className="icon-button" onClick={clickAnterior}>
              <Icon>chevron_left</Icon>
            </IconButton>
            <span id="semana">
              {inicio} - {fin}
            </span>
            <IconButton id="psButtonRight" className="icon-button" onClick={clickSiguiente}>
              <Icon>chevron_right</Icon>
            </IconButton>
          </div>
        </div>
        {planificador && planificador.length > 0 ? (
          <SemanaPlanificador
            state={state}
            fechaInicio={inicioSemana}
            codtienda={tiendaSeleccionada}
            editable={true}
            agenteFiltro={agenteSeleccionado}
          />
        ) : null}
      </div>
    );
  };

  return <Quimera.Template id="PlanificadorSemanal">{render()}</Quimera.Template>;
}

PlanificadorSemanal.propTypes = PropValidation.propTypes;
PlanificadorSemanal.defaultProps = PropValidation.defaultProps;
export default PlanificadorSemanal;
