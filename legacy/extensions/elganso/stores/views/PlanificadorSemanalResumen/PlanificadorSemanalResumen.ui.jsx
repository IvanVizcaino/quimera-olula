import "./PlanificadorSemanalResumen.style.scss";

import { Scheduler } from "@aldabil/react-scheduler";
import Box from "@mui/material/Box";
import Fade from '@mui/material/Fade';
import Tooltip from '@mui/material/Tooltip';
import { DataGrid } from "@mui/x-data-grid";
import { Icon, IconButton } from "@quimera/comps";
import { es as esES } from "date-fns/locale";
import Quimera, { PropValidation, useStateValue } from "quimera";
import { useEffect, useRef, useState } from "react";

function stringToColor(string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

function agentesScheduler(agentes) {
  const resources = [];
  Object.keys(agentes).forEach(function (key, index) {
    const resource = new Object();
    resource.admin_id = key;
    resource.title = agentes[key][key];
    resource.color = stringToColor(agentes[key][key]);
    resources.push(resource);
  });

  return resources;
}

function getIncioSemana() {
  const hoy = new Date();
  const dWeek = hoy.getDay();
  let offset = -6;

  if (dWeek !== 0) {
    offset = -dWeek + 1;
  }

  const inicioSemana = new Date(hoy);
  inicioSemana.setDate(inicioSemana.getDate() + offset);

  return inicioSemana;
}

function getFinSemana() {
  const hoy = new Date();
  const dWeek = hoy.getDay();
  let offset = 0;

  if (dWeek !== 0) {
    offset = 6 - dWeek + 1;
  }

  const finSemana = new Date(hoy);
  finSemana.setDate(finSemana.getDate() + offset);

  return finSemana;
}
function PlanificadorSemanalResumen() {
  const [state, dispatch] = useStateValue();
  const [inicioSemana, setInicioSemana] = useState(getIncioSemana());
  const [finSemana, setFinSemana] = useState(getFinSemana());
  const [modo, setModo] = useState("semana");
  const [selectionModel, setSelectionModel] = useState([]);
  const calendarRef = useRef(Scheduler);
  useEffect(() => {
    dispatch({
      type: "init",
    });
  }, []);

  useEffect(() => {
    if (modo === "semana") {
      if (inicioSemana) {
        const unixTime = inicioSemana.getTime();
        const offset = inicioSemana.getTimezoneOffset();

        const utcTime = unixTime + -1 * offset * 60 * 1000;

        dispatch({
          type: "onGetTramosBySemana",
          payload: {
            semana: new Date(utcTime).toISOString().substring(0, 10),
          },
        });
      }
    }
    if (modo === "mes") {
      const hoy = new Date();
      const hoyTime = hoy.getTime() + -1 * hoy.getTimezoneOffset() * 60 * 1000;
      const hoyFormat = new Date(hoyTime).toISOString().substring(0, 10);

      dispatch({
        type: "onGetTramosSchedulerByAgenteFecha",
        payload: {
          schedulerDate: hoyFormat,
        },
      });
    }
  }, [inicioSemana, modo]);

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

  const convertirAMinutos = (tiempoStr) => {
    if (!tiempoStr || tiempoStr === "No Planif.") return 0;

    // Busca los números antes de 'h' y antes de 'min'
    const horasMatch = tiempoStr.match(/(\d+)h/);
    const minutosMatch = tiempoStr.match(/(\d+)min/);

    const horas = horasMatch ? parseInt(horasMatch[1], 10) : 0;
    const minutos = minutosMatch ? parseInt(minutosMatch[1], 10) : 0;

    return (horas * 60) + minutos;
  };

  const renderRegistro = params => {
    const totalEjecutado = params.row.totalSemanaEjecutada;
    const totalPlanificado = params.row.totalSemanaPlanificada;
    const minutosEjecutados = convertirAMinutos(totalEjecutado);
    const minutosPlanificados = convertirAMinutos(totalPlanificado);

    let fondo = "planificador-dia ";

    if (minutosEjecutados === 0 && minutosPlanificados === 0) {
      fondo = `${fondo}fondo-grey`;
    } else if (minutosEjecutados < minutosPlanificados) {
      fondo = `${fondo}fondo-amarillo`;
    } else {
      fondo = `${fondo}fondo-verde`;
    }

    const tooltipContent = (
      <div style={{ padding: '6px', fontSize: '12px', lineHeight: '1.5' }}>
        <div style={{ fontWeight: 'bold', borderBottom: '1px solid #555', marginBottom: '5px', pb: '2px' }}>
          {semana[0]}
        </div>
        <div>
          <strong>Ejecutado:</strong> {totalEjecutado}
        </div>
        <div>
          <strong>Planificado:</strong> {totalPlanificado}
        </div>
      </div>
    );

    return (
      <div className="planificador-semana" style={{ display: 'flex', gap: '4px' }}>
        <Tooltip
          key={params.row.id}
          title={tooltipContent}
          arrow
          placement="top"
          TransitionComponent={Fade}
          TransitionProps={{ timeout: 200 }}
        >
          <div className={fondo} style={{ cursor: 'pointer' }}>
            {totalEjecutado} / {totalPlanificado}
          </div>
        </Tooltip>
      </div>
    );
  };

  const renderHorasExtra = params => {
    const semana = params.row.semanaEjecutada;
    const horasExtra = params.row.horasExtraSemana;
    const horasCompensadas = params.row.horasExtraSemanaCompensadas;
    const minutosExtra = convertirAMinutos(horasExtra);
    const minutosCompensados = convertirAMinutos(horasCompensadas);

    let fondo = "planificador-dia ";

    if (minutosExtra === 0 && minutosCompensados === 0) {
      fondo = `${fondo}fondo-grey`;
    } else if (horasExtra > horasCompensadas) {
      fondo = `${fondo}fondo-coral`;
    } else {
      fondo = `${fondo}fondo-verde`;
    }

    const tooltipContent = (
      <div style={{ padding: '6px', fontSize: '12px', lineHeight: '1.5' }}>
        <div style={{ fontWeight: 'bold', borderBottom: '1px solid #555', marginBottom: '5px', pb: '2px' }}>
          {semana[0]}
        </div>
        <div>
          <strong>Horas Extra:</strong> {horasExtra}
        </div>
        <div>
          <strong>Compensadas:</strong> {horasCompensadas}
        </div>
      </div>
    );

    return (
      <div className="planificador-semana" style={{ display: 'flex', gap: '4px' }}>
        <Tooltip
          key={params.row.id}
          title={tooltipContent}
          arrow
          placement="top"
          TransitionComponent={Fade}
          TransitionProps={{ timeout: 200 }}
        >
          <div className={fondo} style={{ cursor: 'pointer' }}>
            {horasExtra} / {horasCompensadas}
          </div>
        </Tooltip>
      </div>
    );
  };

  const renderSemana = params => {
    const semana = params.row.semanaEjecutada;
    const semanaPlanificada = params.row.semanaPlanificada;
    const semanaFuturo = params.row.semanaFuturo;
    const semanaTiempoFaltante = params.row.semanaTiempoFaltante;
    const semanaTienePlan = params.row.semanaTienePlan;
    const semanaTieneJornada = params.row.semanaTieneJornada;
    const keySemana = Object.keys(semana);
    const horasExtra = params.row.horasExtraSemana;
    const horasCompensadas = params.row.horasExtraSemanaCompensadas;

    return (
      <div className="planificador-semana" style={{ display: 'flex', gap: '4px' }}>
        {keySemana.map(item => {
          let fondo = "planificador-dia ";

          if (semanaFuturo[item]) {
            fondo = `${fondo}fondo-grey`;
          } else if (semana[item] === "En Curso") {
            fondo = `${fondo}fondo-naranja`;
          } else if (semanaTiempoFaltante[item]) {
            fondo = `${fondo}fondo-amarillo`;
          } else if (!semanaTienePlan[item] && semanaTieneJornada[item]) {
            fondo = `${fondo}fondo-coral`;
          } else {
            fondo = `${fondo}fondo-verde`;
          }

          // --- CONFIGURACIÓN DEL CONTENIDO DEL TOOLTIP ---
          const tooltipContent = (
            <div style={{ padding: '6px', fontSize: '12px', lineHeight: '1.5' }}>
              <div style={{ fontWeight: 'bold', borderBottom: '1px solid #555', marginBottom: '5px', pb: '2px' }}>
                {item.split('-').reverse().join('/')}
              </div>
              <div>
                <strong>Planificado:</strong> {semanaPlanificada[item] || 'No Planif.'}
              </div>

              <div>
                <strong>Ejecutado: </strong>
                {semanaFuturo[item] ? (
                  <span style={{ fontStyle: 'italic', color: '#aaa' }}>Pendiente</span>
                ) :
                  semana[item]
                }
              </div>
            </div>
          );

          // CASO ESPECIAL: Futuro sin plan ni jornada
          if (semanaFuturo[item] && !semanaTienePlan[item] && !semanaTieneJornada[item]) {
            return (
              <Tooltip
                key={item}
                title={tooltipContent}
                arrow
                placement="top"
                TransitionComponent={Fade}
              >
                <div className="planificador-dia fondo-light-grey" style={{ cursor: 'pointer' }}></div>
              </Tooltip>
            );
          }

          // CASO GENERAL: Renderizado normal del día
          return (
            <Tooltip
              key={item}
              title={tooltipContent}
              arrow
              placement="top"
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 200 }}
            >
              <div className={fondo} style={{ cursor: 'pointer' }}>
                {semana[item]}
              </div>
            </Tooltip>
          );
        })}
      </div>
    );
  };

  const renderFormatDayHeader = day => {
    const dateDay = new Date(day);
    let diaSemana = "Dom.";
    switch (dateDay.getDay()) {
      case 0:
        diaSemana = "Dom.";
        break;
      case 1:
        diaSemana = "Lun.";
        break;
      case 2:
        diaSemana = "Mar.";
        break;
      case 3:
        diaSemana = "Mier.";
        break;
      case 4:
        diaSemana = "Jue.";
        break;
      case 5:
        diaSemana = "Vie.";
        break;
      case 6:
        diaSemana = "Sab.";
        break;
      default:
        diaSemana = "Dom.";
        break;
    }

    const dia = dateDay.getDate();
    const mes = `0${dateDay.getMonth() + 1}`.slice(-2);
    const anyo = dateDay.getFullYear();

    return `${diaSemana} ${dia}`;
  };

  const renderHeadSemana = () => {
    const { semana } = state;

    return (
      <div className="head-semana-wrapper">
        <div className="head-semana-title">SEMANA</div>
        <div className="head-semana-content">
          {Object.keys(semana).map(x => (
            <div className="head-semana-content-day">{renderFormatDayHeader(x)}</div>
          ))}
        </div>
      </div>
    );
  };

  const clickSelectorSemanal = () => {
    setModo("semana");
  };

  const clickSelectorMensual = () => {
    setModo("mes");
  };

  const renderPlanificadorSemanal = () => {
    const { planificador, agentes } = state;
    let heighTable = "auto";
    if (agentes) {
      if (Object.keys(agentes).length * 50 > 600) {
        heighTable = 600;
      }
    }

    const columns = [
      {
        field: "nombre",
        headerName: "AGENTE",
        sortable: false,
        width: 400,
        resizable: false,
      },
      {
        field: "semanaPlanificada",
        renderHeader: params => renderHeadSemana(params),
        sortable: false,
        flex: 2,
        headerClassName: "column-semana",
        resizable: false,
        renderCell: params => renderSemana(params),
      },
      {
        field: "totalSemanaPlanificada",
        headerName: "REGISTRO / ESPERADO",
        sortable: false,
        width: 200,
        resizable: false,
        align: "right",
        renderCell: params => renderRegistro(params),
      },
      {
        field: "horasExtraSemana",
        headerName: "H. EXTRA / COMPENSADAS",
        sortable: false,
        width: 200,
        resizable: false,
        align: "right",
        renderCell: params => renderHorasExtra(params),
      },
    ];

    return (
      <Box sx={{ height: heighTable, width: "100%" }}>
        <DataGrid
          rows={planificador}
          disableAutosize
          disableColumnFilter
          disableColumnSelector
          disableDensitySelector
          disableColumnMenu
          disableRowSelectionOnClick
          checkboxSelection
          onRowSelectionModelChange={selection => {
            if (selection.length > 1) {
              const selectionSet = new Set(selectionModel);
              const result = selection.filter(s => !selectionSet.has(s));

              setSelectionModel(result);
            } else {
              setSelectionModel(selection);
            }
          }}
          columns={columns}
          localeText={{
            noRowsLabel: "No hay agentes por planificar",
            toolbarQuickFilterPlaceholder: "Buscar...",
            paginationRowsPerPage: "Líneas por página",
            paginationDisplayedRows: ({ from, to, count }) =>
              `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`,
            footerRowSelected: (count) =>
              count !== 1
                ? `${count} filas seleccionadas`
                : `${count} fila seleccionada`,
          }}
          getRowId={row => row.id}
          getRowHeight={() => "auto"}
          sx={{
            ".MuiDataGrid-virtualScroller::-webkit-scrollbar": { display: "none" },
          }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              printOptions: { disableToolbarButton: true },
              csvOptions: { disableToolbarButton: true },
            }
          }}
        />
      </Box>
    );
  };

  const renderSelectorSemanal = () => {
    const inicio = new Date(inicioSemana).toISOString().substring(0, 10);
    const fin = new Date(finSemana).toISOString().substring(0, 10);

    return (
      <div className="selectorSemanalPlanificadorResumen">
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
    );
  };

  const renderSelectorModo = () => {
    return (
      <div className="headSelector">
        <div className="selector">
          <div
            className={modo === "semana" ? "selector-item selector-item-selected" : "selector-item"}
            onClick={clickSelectorSemanal}
          >
            SEMANALMENTE
          </div>
          <div
            className={modo === "mes" ? "selector-item selector-item-selected" : "selector-item"}
            onClick={clickSelectorMensual}
          >
            MENSUALMENTE
          </div>
        </div>
      </div>
    );
  };

  const formatTramosScheduler = tramosSch => {
    const tramosProcesados = [];
    if (!tramosSch || tramosSch.length === 0) {
      return [];
    }
    tramosSch.forEach(tramo => {
      tramo.start = new Date(tramo.start);
      tramo.end = new Date(tramo.end);
      tramosProcesados.push(tramo);
    });

    return tramosProcesados;
  };

  const formatDateScheduler = date => {
    const selectedDate = new Date(date);
    const dia = `0${selectedDate.getDate()}`.slice(-2);
    const mes = `0${selectedDate.getMonth() + 1}`.slice(-2);
    const anyo = selectedDate.getFullYear();

    return `${anyo}-${mes}-${dia}`;
  };

  const schedulerWeek = {
    weekDays: [0, 1, 2, 3, 4, 5, 6],
    weekStartOn: 1,
    startHour: 9,
    endHour: 22,
    step: 30,
  };

  const schedulerMonth = {
    weekDays: [0, 1, 2, 3, 4, 5, 6],
    weekStartOn: 1,
    startHour: 9,
    endHour: 22,
    step: 30,
  };

  const schedulerDay = {
    startHour: 9,
    endHour: 22,
    step: 30,
  };

  const schedulerTranslations = {
    navigation: {
      month: "Mes",
      week: "Semana",
      day: "Dia",
      today: "Hoy",
      agenda: "Agenda",
    },
    form: {
      addTitle: "Añadir Evento",
      editTitle: "Editar Evento",
      confirm: "Confirmar",
      delete: "Borrar",
      cancel: "Cancelar",
    },
    event: {
      title: "Título",
      subtitle: "Subtítulo",
      start: "Inicio",
      end: "Fin",
      allDay: "Todo el día",
    },
    validation: {
      required: "Requerido",
      invalidEmail: "Email No Válido",
      onlyNumbers: "Sólo se permiten números",
      min: "Mínimo {{min}} letras",
      max: "Máximo {{max}} letras",
    },
    moreEvents: "Más...",
    noDataToDisplay: "No hay datos que mostrar",
    loading: "Cargando...",
  };

  const renderPlanificadorMensual = () => {
    const { agentes, tramosSch } = state;
    const resourcesScheduler = agentesScheduler(agentes);
    const tramosScheduler = formatTramosScheduler(tramosSch);

    return (
      <div className="scheduler-wrapper">
        <Scheduler
          ref={calendarRef}
          view="month"
          week={schedulerWeek}
          month={schedulerMonth}
          day={schedulerDay}
          translations={schedulerTranslations}
          resourceViewMode="tabs"
          resourceFields={{
            idField: "admin_id",
            textField: "title",
            subTextField: "mobile",
            avatarField: "title",
            colorField: "color",
          }}
          locale={esES}
          events={tramosScheduler}
          resources={resourcesScheduler}
          hourFormat={24}
          agenda={false}
          stickyNavigation={true}
          onResourceChange={resource => {
            dispatch({
              type: "onGetTramosSchedulerByAgenteFecha",
              payload: {
                schedulerResource: resource.admin_id,
                schedulerDate: formatDateScheduler(calendarRef.current?.scheduler?.selectedDate),
                schedulerView: calendarRef.current?.scheduler?.view,
              },
            });
          }}
          onSelectedDateChange={date => {
            dispatch({
              type: "onGetTramosSchedulerByAgenteFecha",
              payload: {
                schedulerResource: calendarRef.current?.scheduler?.selectedResource,
                schedulerDate: formatDateScheduler(date),
                schedulerView: calendarRef.current?.scheduler?.view,
              },
            });
          }}
          onViewChange={(view, agenda) => {
            dispatch({
              type: "onGetTramosSchedulerByAgenteFecha",
              payload: {
                schedulerResource: calendarRef.current?.scheduler?.selectedResource,
                schedulerDate: formatDateScheduler(calendarRef.current?.scheduler?.selectedDate),
                schedulerView: view,
              },
            });
          }}
        />
      </div>
    );
  };

  const render = () => {
    const { planificador } = state;

    const planificadorMensual = "planificadorMensual";

    if (modo === "semana") {
      return (
        <>
          <div className="headSelector-Wrapper">
            {renderSelectorModo()}
            {renderSelectorSemanal()}
          </div>
          {planificador ? renderPlanificadorSemanal() : null}
        </>
      );
    }

    if (modo === "mes") {
      return (
        <>
          <div className="headSelector-Wrapper">{renderSelectorModo()}</div>
          {planificadorMensual ? renderPlanificadorMensual() : null}
        </>
      );
    }

    return (
      <>
        <div className="headSelector-Wrapper">{renderSelectorModo()}</div>
        <div>POR FAVOR SELECCIONE UN MODO</div>
      </>
    );
  };

  return <Quimera.Template id="PlanificadorSemanalResumen">{render()}</Quimera.Template>;
}

PlanificadorSemanalResumen.propTypes = PropValidation.propTypes;
PlanificadorSemanalResumen.defaultProps = PropValidation.defaultProps;
export default PlanificadorSemanalResumen;
