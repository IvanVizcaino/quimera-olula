import "./ResumenAgente.style.scss";

import { Button, Icon, IconButton } from "@quimera/comps";
import Quimera, { PropValidation, useStateValue, util } from "quimera";
import { useEffect, useState } from "react";

import { ResumenSemana, SemanaPlanificador } from "../../comps";

function ResumenAgente() {
  const [state, dispatch] = useStateValue();
  const [showType, setShowType] = useState("week");
  const [inicioSemana, setInicioSemana] = useState(new Date());
  const [finSemana, setFinSemana] = useState(new Date());
  const [inicioMes, setInicioMes] = useState(new Date());
  const [finMes, setFinMes] = useState(new Date());
  const [agente, setAgente] = useState(null);
  const usuario = util.getUser();
  const { planificador } = state;
  // const { user, codtienda = null } = usuario;
  // const {
  //   config: { tiendas },
  // } = state;

  // const checkUser = () => {
  //   if (tiendas) {
  //     for (const [key, value] of Object.entries(tiendas)) {
  //       if (key === codtienda) {
  //         if (value.agentes.includes(user)) {
  //           setAgente(user);
  //         }
  //       }
  //     }
  //   }
  // };

  const clickSemanaAbajo = () => {
    const date = new Date(inicioSemana);
    date.setDate(date.getDate() - 7);
    setInicioSemana(date);
    const dateFin = new Date(finSemana);
    dateFin.setDate(dateFin.getDate() - 7);
    setFinSemana(dateFin);
  };

  const clickSemanaArriba = () => {
    const date = new Date(inicioSemana);
    date.setDate(date.getDate() + 7);
    setInicioSemana(date);
    const dateFin = new Date(finSemana);
    dateFin.setDate(dateFin.getDate() + 7);
    setFinSemana(dateFin);
  };

  const setMonth = (date, up = "equal") => {
    const actualYear = date.getFullYear();
    let actualMonth = date.getMonth();
    if (up === "up") {
      actualMonth = date.getMonth() + 1;
    } else if (up === "down") {
      actualMonth = date.getMonth() - 1;
    } else {
      // No hacemos nada
    }

    const iMes = new Date(actualYear, actualMonth, 2);
    const fMes = new Date(actualYear, actualMonth + 1);

    setInicioMes(iMes);
    setFinMes(fMes);
  };

  const initFechas = () => {
    // Fechas Semana
    const date = new Date();

    while (date.getDay() !== 1) {
      date.setDate(date.getDate() - 1);
    }

    setInicioSemana(new Date(date));
    date.setDate(date.getDate() + 6);
    setFinSemana(new Date(date));

    // Fechas Mes
    setMonth(new Date(), "equal");
  };

  useEffect(() => {
    // checkUser();
    initFechas();

    dispatch({
      type: "init",
    });
  }, [dispatch]);

  useEffect(() => {
    if (showType && inicioSemana && inicioMes) {
      dispatch({
        type: "onGetResumenByAgente",
        payload: {
          showType,
          inicioSemana: new Date(inicioSemana).toISOString().substring(0, 10),
          inicioMes: new Date(inicioMes).toISOString().substring(0, 10),
        },
      });
    }
  }, [showType, inicioSemana, inicioMes]);

  const clickAnterior = () => {
    if (showType === "week") {
      clickSemanaAbajo();
    } else {
      setMonth(inicioMes, "down");
    }
  };

  const clickSiguiente = () => {
    if (showType === "week") {
      clickSemanaArriba();
    } else {
      setMonth(inicioMes, "up");
    }
  };

  const render = () => {
    const inicio = new Date(showType === "week" ? inicioSemana : inicioMes)
      .toISOString()
      .substring(0, 10);
    const fin = new Date(showType === "week" ? finSemana : finMes).toISOString().substring(0, 10);
    const { codtienda } = usuario;

    return (
      <div id="resumenAgente" className="page-container">
        <h2 className="main">
          {showType === "week" ? "Resumen Semanal" : "Resumen Mensual"}
          <div className="changeTypeResumen">
            <Button
              id="resumenSemanal"
              className={showType === "week" ? "active" : ""}
              text="R. Semanal"
              variant="outlined"
              color="primary"
              startIcon={<Icon>list</Icon>}
              onClick={() => (showType === "month" ? setShowType("week") : null)}
            />
            <Button
              id="resumenMensual"
              className={showType === "month" ? "active" : ""}
              text="R. Mensual"
              variant="outlined"
              color="primary"
              startIcon={<Icon>calendar_today</Icon>}
              onClick={() => (showType === "week" ? setShowType("month") : null)}
            />
          </div>
        </h2>
        <div>
          <div className="container-title">
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

          {state.planificador && state.planificador.length > 0 ? (
            <>
              <ResumenSemana
                state={state}
                type={showType === "week" ? "week" : "month"}
                fechaInicio={showType === "week" ? inicioSemana : inicioMes}
                codtienda={codtienda}
                codAgente={agente}
              />
              <SemanaPlanificador
                state={state}
                type={showType === "week" ? "week" : "month"}
                fechaInicio={showType === "week" ? inicioSemana : inicioMes}
                codtienda={codtienda}
                codAgente={agente}
                className="planificadorResumen"
                editable={false}
              />
            </>
          ) : null}
        </div>
      </div>
    );
  };

  return <Quimera.Template id="ResumenAgente">{render()}</Quimera.Template>;
}

ResumenAgente.propTypes = PropValidation.propTypes;
ResumenAgente.defaultProps = PropValidation.defaultProps;
export default ResumenAgente;
